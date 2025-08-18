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
          <div class="header-info">
            <div class="back-button">
              <button mat-icon-button (click)="goBack()">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
            
            <div class="title-section">
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
      background-color: var(--background-light);
    }

    .header-section {
      background-color: var(--background-white);
      color: var(--text-primary);
      padding: 32px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .back-button {
      flex-shrink: 0;
    }

    .back-button button {
      color: var(--text-secondary);
    }

    .title-section {
      flex: 1;
    }

    .title-section h1 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .title-section p {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text-secondary);
      font-weight: 400;
    }

    .header-actions {
      flex-shrink: 0;
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
      background-color: var(--background-white);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .poll-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-heavy);
    }

    .poll-avatar {
      background-color: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Fix images breaking layout: enforce aspect and crop nicely */
    .poll-card img.mat-card-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      object-position: center;
      background-color: var(--background-light);
      display: block;
    }

    .poll-description {
      margin: 0 0 16px 0;
      color: var(--text-secondary);
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
      color: var(--text-secondary);
    }

    .stat-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--primary-color);
    }

    .status-indicator {
      margin-bottom: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 64px 32px;
      color: var(--text-secondary);
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
      color: var(--text-primary);
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

      .header-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .title-section h1 {
        font-size: 2rem;
      }

      .header-actions {
        align-self: stretch;
      }

      .header-actions button {
        width: 100%;
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