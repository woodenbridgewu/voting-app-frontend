import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PollService, VoteHistory } from '../../../../services/poll.service';

@Component({
    selector: 'app-vote-history',
    template: `
    <div class="vote-history-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="back-button">
            <button mat-icon-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
            </button>
          </div>
          
          <div class="header-info">
            <h1>投票歷史</h1>
            <p>查看您的所有投票記錄</p>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="content-section">
        <div class="content-wrapper">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="loading-section">
            <app-loading-spinner message="載入投票歷史中..."></app-loading-spinner>
          </div>

          <!-- History Content -->
          <div *ngIf="!isLoading" class="history-content">
            <!-- Stats Summary -->
            <div class="stats-card">
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-icon">
                    <mat-icon>how_to_vote</mat-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ totalVotes }}</div>
                    <div class="stat-label">總投票數</div>
                  </div>
                </div>

                <div class="stat-item">
                  <div class="stat-icon">
                    <mat-icon>poll</mat-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ uniquePolls }}</div>
                    <div class="stat-label">參與投票</div>
                  </div>
                </div>

                <div class="stat-item">
                  <div class="stat-icon">
                    <mat-icon>schedule</mat-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ formatDate(firstVote) }}</div>
                    <div class="stat-label">首次投票</div>
                  </div>
                </div>

                <div class="stat-item">
                  <div class="stat-icon">
                    <mat-icon>update</mat-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ formatDate(lastVote) }}</div>
                    <div class="stat-label">最後投票</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vote History List -->
            <div *ngIf="voteHistory.length > 0" class="history-list">
              <h3>投票記錄</h3>
              
              <div class="history-items">
                <div *ngFor="let vote of voteHistory" class="history-item">
                  <div class="vote-content">
                    <div class="vote-info">
                      <div class="poll-title">
                        <h4>{{ vote.poll.title }}</h4>
                        <span class="vote-date">{{ formatDate(vote.votedAt) }}</span>
                      </div>
                      
                      <div class="vote-choice">
                        <div class="choice-content">
                          <img *ngIf="vote.option.imageUrl" 
                               [src]="vote.option.imageUrl" 
                               [alt]="vote.option.text"
                               class="choice-image">
                          <span class="choice-text">{{ vote.option.text }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="vote-actions">
                      <button mat-button color="primary" (click)="viewPoll(vote.poll.id)">
                        <mat-icon>visibility</mat-icon>
                        查看投票
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <mat-paginator
                [length]="totalCount"
                [pageSize]="pageSize"
                [pageIndex]="currentPage - 1"
                [pageSizeOptions]="[10, 20, 50]"
                (page)="onPageChange($event)"
                showFirstLastButtons>
              </mat-paginator>
            </div>

            <!-- Empty State -->
            <div *ngIf="!isLoading && voteHistory.length === 0" class="empty-state">
              <mat-icon>history</mat-icon>
              <h3>還沒有投票記錄</h3>
              <p>開始參與投票，您的記錄會顯示在這裡</p>
              <button mat-raised-button color="primary" routerLink="/polls">
                瀏覽投票
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .vote-history-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .header-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px 0;
    }

    .header-content {
      max-width: 1000px;
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

    .content-section {
      padding: 32px 0;
    }

    .content-wrapper {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .loading-section {
      padding: 64px 0;
      text-align: center;
    }

    .history-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .stats-card {
      background: white;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stat-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: rgba(0,0,0,0.8);
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: rgba(0,0,0,0.6);
    }

    .history-list h3 {
      margin: 0 0 24px 0;
      color: rgba(0,0,0,0.8);
      font-size: 1.5rem;
    }

    .history-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 32px;
    }

    .history-item {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .history-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .vote-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .vote-info {
      flex: 1;
    }

    .poll-title {
      margin-bottom: 12px;
    }

    .poll-title h4 {
      margin: 0 0 4px 0;
      color: rgba(0,0,0,0.8);
      font-size: 1.2rem;
    }

    .vote-date {
      font-size: 0.9rem;
      color: rgba(0,0,0,0.5);
    }

    .vote-choice {
      display: flex;
      align-items: center;
    }

    .choice-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      background-color: #f3f4ff;
      border-radius: 20px;
      border: 1px solid #e0e0e0;
    }

    .choice-image {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      object-fit: cover;
    }

    .choice-text {
      font-weight: 500;
      color: #3f51b5;
    }

    .vote-actions {
      flex-shrink: 0;
    }

    .vote-actions button {
      padding: 8px 16px;
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
      .header-content,
      .content-wrapper {
        padding: 0 16px;
      }

      .header-info h1 {
        font-size: 2rem;
      }

      .stats-card {
        padding: 20px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .history-item {
        padding: 16px;
      }

      .vote-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .vote-actions {
        align-self: stretch;
      }

      .vote-actions button {
        width: 100%;
      }
    }
  `]
})
export class VoteHistoryComponent implements OnInit {
    voteHistory: VoteHistory[] = [];
    isLoading = false;
    currentPage = 1;
    pageSize = 10;
    totalCount = 0;

    constructor(
        private pollService: PollService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.loadVoteHistory();
    }

    loadVoteHistory() {
        this.isLoading = true;

        const params = {
            page: this.currentPage,
            limit: this.pageSize
        };

        this.pollService.getVoteHistory(params).subscribe({
            next: (response) => {
                this.voteHistory = response.votes || [];
                this.totalCount = response.pagination.total;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading vote history:', error);
                this.isLoading = false;
                this.snackBar.open('載入投票歷史失敗', '關閉', { duration: 3000 });
            }
        });
    }

    onPageChange(event: PageEvent) {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadVoteHistory();
    }

    viewPoll(pollId: string) {
        this.router.navigate(['/polls', pollId]);
    }

    goBack() {
        this.router.navigate(['/profile']);
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Computed properties for stats
    get totalVotes(): number {
        return this.totalCount;
    }

    get uniquePolls(): number {
        const pollIds = new Set(this.voteHistory.map(vote => vote.poll.id));
        return pollIds.size;
    }

    get firstVote(): string {
        if (this.voteHistory.length === 0) return '';
        return this.voteHistory[this.voteHistory.length - 1]?.votedAt || '';
    }

    get lastVote(): string {
        if (this.voteHistory.length === 0) return '';
        return this.voteHistory[0]?.votedAt || '';
    }
} 