import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PollService, Poll } from '../../../../services/poll.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-my-polls',
    template: `
    <div class="my-polls-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="back-button">
            <button mat-icon-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
            </button>
          </div>
          
          <div class="header-info">
            <h1>我的投票</h1>
            <p>管理您創建的所有投票</p>
          </div>

          <div class="header-actions">
            <button mat-raised-button color="primary" routerLink="/polls/create">
              <mat-icon>add</mat-icon>
              創建新投票
            </button>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="content-section">
        <div class="content-wrapper">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="loading-section">
            <app-loading-spinner message="載入您的投票中..."></app-loading-spinner>
          </div>

          <!-- Polls Grid -->
          <div *ngIf="!isLoading && polls.length > 0" class="polls-grid">
            <mat-card *ngFor="let poll of polls" class="poll-card">
              <img mat-card-image [src]="poll.imageUrl || '/assets/default-option-image.svg'" [alt]="poll.title">
              <mat-card-header>
                <div mat-card-avatar class="poll-avatar">
                  <mat-icon>poll</mat-icon>
                </div>
                <mat-card-title>{{ poll.title }}</mat-card-title>
                <mat-card-subtitle>
                  創建於 {{ formatDate(poll.createdAt) }}
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
                <button mat-button color="primary" (click)="viewPoll(poll.id)">
                  <mat-icon>visibility</mat-icon>
                  查看
                </button>
                <button mat-button color="accent" (click)="viewStats(poll.id)">
                  <mat-icon>analytics</mat-icon>
                  統計
                </button>
                <button mat-button color="warn" (click)="deletePoll(poll.id, poll.title)">
                  <mat-icon>delete</mat-icon>
                  刪除
                </button>
              </mat-card-actions>
            </mat-card>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && polls.length === 0" class="empty-state">
            <mat-icon>inbox</mat-icon>
            <h3>您還沒有創建任何投票</h3>
            <p>開始創建您的第一個投票，讓社群參與決策</p>
            <button mat-raised-button color="primary" routerLink="/polls/create">
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
    .my-polls-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .header-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px 0;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      position: relative;
    }

    .back-button {
      margin-bottom: 16px;
    }

    .back-button button {
      color: white;
    }

    .header-info {
      margin-bottom: 24px;
    }

    .header-info h1 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .header-info p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .header-actions {
      position: absolute;
      top: 0;
      right: 24px;
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

      .header-info h1 {
        font-size: 2rem;
      }

      .header-actions {
        position: static;
        margin-top: 16px;
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
export class MyPollsComponent implements OnInit {
    polls: Poll[] = [];
    isLoading = false;
    currentPage = 1;
    pageSize = 6;
    totalCount = 0;

    constructor(
        private pollService: PollService,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.loadMyPolls();
    }

    loadMyPolls() {
        this.isLoading = true;

        const params = {
            page: this.currentPage,
            limit: this.pageSize
        };

        this.pollService.getMyPolls(params).subscribe({
            next: (response) => {
                // 轉換後端 snake_case 欄位為前端 camelCase 欄位
                this.polls = (response.polls || []).map((poll: any) => ({
                    ...poll,
                    isActive: poll.is_active,
                    endDate: poll.end_date,
                    createdAt: poll.created_at,
                    startDate: poll.start_date,
                    creatorName: poll.creator_name,
                    totalVotes: poll.total_votes,
                    imageUrl: poll.image_url
                }));
                this.totalCount = response.pagination.total;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading my polls:', error);
                this.isLoading = false;
                this.snackBar.open('載入投票失敗', '關閉', { duration: 3000 });
            }
        });
    }

    onPageChange(event: PageEvent) {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadMyPolls();
    }

    viewPoll(pollId: string) {
        this.router.navigate(['/polls', pollId]);
    }

    viewStats(pollId: string) {
        this.router.navigate(['/polls', pollId, 'stats']);
    }

    deletePoll(pollId: string, pollTitle: string) {
        // You can implement a confirmation dialog here
        if (confirm(`確定要刪除投票「${pollTitle}」嗎？此操作無法復原。`)) {
            this.pollService.deletePoll(pollId).subscribe({
                next: () => {
                    this.snackBar.open('投票已刪除', '關閉', { duration: 3000 });
                    this.loadMyPolls(); // Reload the list
                },
                error: (error) => {
                    console.error('Error deleting poll:', error);
                    this.snackBar.open('刪除投票失敗', '關閉', { duration: 3000 });
                }
            });
        }
    }

    goBack() {
        this.router.navigate(['/polls']);
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