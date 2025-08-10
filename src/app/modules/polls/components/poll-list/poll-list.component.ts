import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PollService, Poll } from '../../../../services/poll.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-poll-list',
    template: `
    <div class="poll-list-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <h1>所有投票</h1>
          <p class="subtitle">參與社群投票，讓您的聲音被聽見</p>
          
          <div class="search-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>搜尋投票</mat-label>
              <input matInput [formControl]="searchControl" placeholder="輸入關鍵字搜尋...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <div class="filter-section">
              <mat-form-field appearance="outline">
                <mat-label>排序方式</mat-label>
                <mat-select [(value)]="sortBy" (selectionChange)="onSortChange()">
                  <mat-option value="created_at">最新</mat-option>
                  <mat-option value="title">標題</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>狀態</mat-label>
                <mat-select [(value)]="activeFilter" (selectionChange)="onFilterChange()">
                  <mat-option value="true">進行中</mat-option>
                  <mat-option value="false">已結束</mat-option>
                  <mat-option value="all">全部</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="content-section">
        <div class="content-wrapper">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="loading-section">
            <app-loading-spinner message="載入投票中..."></app-loading-spinner>
          </div>

          <!-- Polls Grid -->
          <div *ngIf="!isLoading && polls.length > 0" class="polls-grid">
            <mat-card *ngFor="let poll of polls" class="poll-card" (click)="viewPoll(poll.id)">
              <mat-card-header>
                <div mat-card-avatar class="poll-avatar">
                  <mat-icon>poll</mat-icon>
                </div>
                <mat-card-title>{{ poll.title }}</mat-card-title>
                <mat-card-subtitle>
                  由 {{ poll.creatorName }} 創建 · {{ formatDate(poll.createdAt) }}
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <p *ngIf="poll.description" class="poll-description">
                  {{ poll.description }}
                </p>
                
                <div class="poll-stats">
                  <div class="stat-item">
                    <mat-icon>how_to_vote</mat-icon>
                    <span>{{ poll.totalVotes }} 票</span>
                  </div>
                  <div class="stat-item">
                    <mat-icon>list</mat-icon>
                    <span>{{ poll.options.length }} 選項</span>
                  </div>
                  <div class="stat-item" *ngIf="poll.endDate">
                    <mat-icon>event</mat-icon>
                    <span>{{ formatDate(poll.endDate) }} 截止</span>
                  </div>
                </div>

                <div class="status-indicator">
                  <mat-chip 
                    [color]="getStatusColor(poll)" 
                    selected>
                    {{ getStatusText(poll) }}
                  </mat-chip>
                </div>
              </mat-card-content>

              <mat-card-actions align="end">
                <button mat-button color="primary" (click)="viewPoll(poll.id, $event)">
                  <mat-icon>visibility</mat-icon>
                  查看投票
                </button>
              </mat-card-actions>
            </mat-card>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && polls.length === 0" class="empty-state">
            <mat-icon>inbox</mat-icon>
            <h3>沒有找到投票</h3>
            <p>目前沒有符合條件的投票，試試調整搜尋條件。</p>
            <button mat-raised-button color="primary" routerLink="/polls/create" *ngIf="isAuthenticated">
              創建第一個投票
            </button>
          </div>

          <!-- Pagination -->
          <mat-paginator
            *ngIf="!isLoading && polls.length > 0"
            [length]="totalCount"
            [pageSize]="pageSize"
            [pageIndex]="currentPage - 1"
            [pageSizeOptions]="[6, 12, 24]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .poll-list-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .header-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 48px 0;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .subtitle {
      margin: 0 0 32px 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .search-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 600px;
    }

    .search-field {
      width: 100%;
    }

    .search-field ::ng-deep .mat-mdc-form-field-flex {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .search-field ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: transparent;
    }

    .search-field ::ng-deep .mdc-notched-outline__leading,
    .search-field ::ng-deep .mdc-notched-outline__notch,
    .search-field ::ng-deep .mdc-notched-outline__trailing {
      border-color: rgba(255, 255, 255, 0.3);
    }

    .search-field ::ng-deep .mat-mdc-form-field-label {
      color: rgba(255, 255, 255, 0.7);
    }

    .search-field ::ng-deep input {
      color: white;
    }

    .filter-section {
      display: flex;
      gap: 16px;
    }

    .filter-section mat-form-field {
      flex: 1;
      min-width: 120px;
    }

    .content-section {
      padding: 32px 0;
    }

    .content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .loading-section {
      padding: 64px 0;
      text-align: center;
    }

    .polls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .poll-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      height: fit-content;
    }

    .poll-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .poll-avatar {
      background-color: #3f51b5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .poll-description {
      margin: 0 0 16px 0;
      color: rgba(0,0,0,0.6);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .poll-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9rem;
      color: rgba(0,0,0,0.6);
    }

    .stat-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .status-indicator {
      margin-bottom: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 64px 32px;
      color: rgba(0,0,0,0.6);
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: rgba(0,0,0,0.8);
    }

    .empty-state p {
      margin: 0 0 24px 0;
    }

    mat-paginator {
      background-color: transparent;
      margin-top: 32px;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 16px;
      }

      .header-content h1 {
        font-size: 2rem;
      }

      .filter-section {
        flex-direction: column;
      }

      .polls-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .content-wrapper {
        padding: 0 16px;
      }
    }
  `]
})
export class PollListComponent implements OnInit {
    polls: Poll[] = [];
    searchControl = new FormControl('');
    sortBy: string = 'created_at';
    activeFilter: string = 'true';

    isLoading = false;
    currentPage = 1;
    pageSize = 6;
    totalCount = 0;

    isAuthenticated = false;

    constructor(
        private pollService: PollService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        // Check authentication status immediately
        this.checkAuthStatus();
        
        // Subscribe to authentication changes
        this.authService.isAuthenticated$.subscribe(auth => {
            this.isAuthenticated = auth;
        });

        this.loadPolls();

        // Setup search
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(() => {
            this.currentPage = 1;
            this.loadPolls();
        });
    }

    private checkAuthStatus(): void {
        // If we have a valid token but the observable hasn't been set yet,
        // try to load the user from token
        if (this.authService.isTokenValid() && !this.authService.isAuthenticated()) {
            this.authService.loadUserFromToken();
        }
    }

    loadPolls() {
        this.isLoading = true;

        const params = {
            page: this.currentPage,
            limit: this.pageSize,
            search: this.searchControl.value || '',
            sortBy: this.sortBy,
            sortOrder: 'DESC',
            active: this.activeFilter === 'all' ? undefined : this.activeFilter === 'true'
        };

        this.pollService.getPolls(params).subscribe({
            next: (response) => {
                // 轉換後端 snake_case 欄位為前端 camelCase 欄位
                this.polls = (response.polls || []).map((poll: any) => ({
                    ...poll,
                    isActive: poll.is_active,
                    endDate: poll.end_date,
                    createdAt: poll.created_at,
                    startDate: poll.start_date,
                    creatorName: poll.creator_name,
                    totalVotes: poll.total_votes
                }));
                this.totalCount = response.pagination.total;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading polls:', error);
                this.isLoading = false;
            }
        });
    }

    onSortChange() {
        this.currentPage = 1;
        this.loadPolls();
    }

    onFilterChange() {
        this.currentPage = 1;
        this.loadPolls();
    }

    onPageChange(event: PageEvent) {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadPolls();
    }

    viewPoll(pollId: string, event?: Event) {
        if (event) {
            event.stopPropagation();
        }
        this.router.navigate(['/polls', pollId]);
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getStatusColor(poll: Poll): 'primary' | 'warn' | 'accent' {
        if (!poll.isActive) return 'warn';
        if (poll.endDate && new Date(poll.endDate) < new Date()) return 'warn';
        return 'primary';
    }

    getStatusText(poll: Poll): string {
        if (!poll.isActive) return '已停用';
        if (poll.endDate && new Date(poll.endDate) < new Date()) return '已結束';
        return '進行中';
    }
}