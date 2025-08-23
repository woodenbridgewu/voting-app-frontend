import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PollService, Poll, VoteRequest } from '../../../../services/poll.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-poll-detail',
    template: `
    <div class="poll-detail-container">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-section">
        <app-loading-spinner message="載入投票詳情中..."></app-loading-spinner>
      </div>

      <!-- Poll Detail Content -->
      <div *ngIf="!isLoading && poll" class="poll-content">
        <!-- Header Section -->
        <div class="poll-header">
          <div class="header-content">
            <div class="back-button">
              <button mat-icon-button (click)="goBack()">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
            
            <div class="poll-info">
              <img *ngIf="poll.imageUrl" [src]="poll.imageUrl" [alt]="poll.title" class="cover-image" />
              <h1>{{ poll.title }}</h1>
              <p *ngIf="poll.description" class="description">{{ poll.description }}</p>
              
              <div class="poll-meta">
                <div class="meta-item">
                  <mat-icon>person</mat-icon>
                  <span>由 {{ poll.creatorName }} 創建</span>
                </div>
                <div class="meta-item">
                  <mat-icon>event</mat-icon>
                  <span>創建於 {{ formatDate(poll.createdAt) }}</span>
                </div>
                <div class="meta-item" *ngIf="poll.endDate">
                  <mat-icon>schedule</mat-icon>
                  <span>截止於 {{ formatDate(poll.endDate) }}</span>
                </div>
                <div class="meta-item">
                  <mat-icon>how_to_vote</mat-icon>
                  <span>{{ poll.totalVotes }} 票</span>
                </div>
              </div>

              <div class="status-chip">
                <mat-chip [color]="getStatusColor()" selected>
                  {{ getStatusText() }}
                </mat-chip>
              </div>
            </div>
          </div>
        </div>

        <!-- Voting Section -->
        <div class="voting-section">
          <div class="voting-content">
            <!-- Not Authenticated -->
            <div *ngIf="!isAuthenticated" class="auth-required">
              <mat-icon>lock</mat-icon>
              <h3>需要登入才能投票</h3>
              <p>請先登入您的帳戶以參與投票</p>
              <button mat-raised-button color="primary" routerLink="/auth/login">
                立即登入
              </button>
            </div>

            <!-- Already Voted -->
            <div *ngIf="isAuthenticated && poll.hasVotedToday" class="already-voted">
              <mat-icon>check_circle</mat-icon>
              <h3>您今天已經投票了</h3>
              <p>感謝您的參與！明天可以再次投票。</p>
            </div>

            <!-- Can Vote -->
            <div *ngIf="isAuthenticated && !poll.hasVotedToday && poll.isActive" class="vote-options">
              <h3>請選擇您的投票選項</h3>
              <p>每個選項只能投票一次</p>
              
              <div class="options-grid">
                <div 
                  *ngFor="let option of poll.options; let i = index" 
                  class="option-card"
                  [class.selected]="selectedOptionId === option.id"
                  (click)="selectOption(option.id)">
                  
                  <div class="option-image-container">
                    <img 
                      [src]="option.imageUrl || '/assets/default-option-image.svg'" 
                      [alt]="option.text"
                      class="option-image"
                      (error)="onImageError($event, option)">
                    <div class="image-overlay">
                      <mat-icon>photo</mat-icon>
                    </div>
                  </div>
                  
                  <div class="option-content">
                    <div class="option-text">
                      <h4>{{ option.text }}</h4>
                      <p *ngIf="option.description" class="option-description">{{ option.description }}</p>
                      <p *ngIf="!option.description" class="option-description">點擊選擇此選項</p>
                    </div>
                    
                    <div class="option-stats">
                      <div class="vote-count">
                        <mat-icon>how_to_vote</mat-icon>
                        <span>{{ option.voteCount }} 票</span>
                      </div>
                      <div class="percentage">
                        <mat-icon>pie_chart</mat-icon>
                        <span>{{ option.percentage || 0 }}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      [style.width.%]="option.percentage || 0">
                    </div>
                  </div>
                  
                  <div class="selection-indicator">
                    <mat-icon *ngIf="selectedOptionId === option.id">check_circle</mat-icon>
                  </div>
                </div>
              </div>
              
              <div class="vote-actions">
                <button 
                  mat-raised-button 
                  color="primary" 
                  [disabled]="!selectedOptionId || isVoting"
                  (click)="submitVote()">
                  <mat-icon>how_to_vote</mat-icon>
                  {{ isVoting ? '投票中...' : '提交投票' }}
                </button>
              </div>
            </div>

            <!-- Poll Ended -->
            <div *ngIf="!poll.isActive || (poll.endDate && isPollEnded())" class="poll-ended">
              <mat-icon>event_busy</mat-icon>
              <h3>投票已結束</h3>
              <p>此投票已不再接受新的投票</p>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <div class="results-section">
          <div class="results-content">
            <h3>投票結果</h3>
            
            <div class="results-grid">
              <div 
                *ngFor="let option of poll.options; let i = index" 
                class="result-card"
                [class.winner]="isWinner(option)">
                
                <div class="result-image-container">
                  <img 
                    [src]="option.imageUrl || '/assets/default-option-image.svg'" 
                    [alt]="option.text"
                    class="result-image">
                  <div class="rank-badge">{{ i + 1 }}</div>
                  <div class="winner-badge" *ngIf="isWinner(option)">
                    <mat-icon>emoji_events</mat-icon>
                  </div>
                </div>
                
                <div class="result-content">
                  <div class="result-header">
                    <h4>{{ option.text }}</h4>
                    <p *ngIf="option.description" class="result-description">{{ option.description }}</p>
                    <div class="vote-details">
                      <div class="vote-count">
                        <mat-icon>how_to_vote</mat-icon>
                        <span>{{ option.voteCount }} 票</span>
                      </div>
                      <div class="percentage">
                        <mat-icon>pie_chart</mat-icon>
                        <span>{{ option.percentage || 0 }}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="result-progress">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        [style.width.%]="option.percentage || 0">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons" *ngIf="poll.canEdit">
          <button mat-button color="primary" [routerLink]="['/polls', poll.id, 'stats']">
            <mat-icon>analytics</mat-icon>
            查看統計
          </button>
          <button mat-button color="accent" [routerLink]="['/polls', poll.id, 'edit']">
            <mat-icon>edit</mat-icon>
            編輯投票
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading && !poll" class="error-state">
        <mat-icon>error</mat-icon>
        <h3>找不到投票</h3>
        <p>您要查看的投票可能已被刪除或不存在</p>
        <button mat-raised-button color="primary" routerLink="/polls">
          返回投票列表
        </button>
      </div>
    </div>
  `,
    styles: [`
    .poll-detail-container {
      min-height: 100vh;
      background-color: var(--background-light);
    }

    .loading-section {
      padding: 64px 0;
      text-align: center;
    }

    .poll-header {
      background-color: var(--background-white);
      color: var(--text-primary);
      padding: 32px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .header-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 24px;
      position: relative;
    }

    .back-button {
      margin-bottom: 16px;
    }

    .back-button button {
      color: var(--text-secondary);
    }

    .poll-info h1 {
      margin: 0 0 16px 0;
      font-size: 2.5rem;
      font-weight: 300;
      color: var(--text-primary);
    }

    .cover-image {
      width: 100%;
      max-height: 360px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 16px;
      box-shadow: var(--shadow-medium);
    }

    .description {
      margin: 0 0 24px 0;
      font-size: 1.1rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .poll-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      margin-bottom: 24px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .meta-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--primary-color);
    }

    .status-chip {
      margin-top: 16px;
    }

    .voting-section {
      padding: 32px 0;
    }

    .voting-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .auth-required,
    .already-voted,
    .poll-ended {
      text-align: center;
      padding: 48px 24px;
      background: var(--background-white);
      border-radius: 12px;
      box-shadow: var(--shadow-light);
      border: 1px solid var(--border-color);
    }

    .auth-required mat-icon,
    .already-voted mat-icon,
    .poll-ended mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
      color: var(--text-secondary);
    }

    .auth-required h3,
    .already-voted h3,
    .poll-ended h3 {
      margin: 0 0 8px 0;
      color: var(--text-primary);
    }

    .auth-required p,
    .already-voted p,
    .poll-ended p {
      margin: 0 0 24px 0;
      color: var(--text-secondary);
    }

    .vote-options {
      background: var(--background-white);
      border-radius: 12px;
      padding: 32px;
      box-shadow: var(--shadow-light);
      border: 1px solid var(--border-color);
    }

    .vote-options h3 {
      margin: 0 0 8px 0;
      color: var(--text-primary);
    }

    .vote-options p {
      margin: 0 0 24px 0;
      color: var(--text-secondary);
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .option-card {
      border: 2px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      background: var(--background-white);
      box-shadow: var(--shadow-light);
    }

    .option-card:hover {
      border-color: var(--primary-color);
      transform: translateY(-4px);
      box-shadow: var(--shadow-heavy);
    }

    .option-card.selected {
      border-color: var(--primary-color);
      background-color: rgba(33, 150, 243, 0.04);
      box-shadow: var(--shadow-medium);
    }

    .option-image-container {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .option-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
      display: block;
      max-width: 100%;
    }

    .option-card:hover .option-image {
      transform: scale(1.05);
    }

    .image-overlay {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0,0,0,0.6);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .image-overlay mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .option-content {
      padding: 20px;
    }

    .option-text {
      margin-bottom: 16px;
    }

    .option-text h4 {
      margin: 0 0 8px 0;
      color: var(--text-primary);
      font-size: 1.2rem;
      font-weight: 600;
    }

    .option-description {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .option-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .vote-count,
    .percentage {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .vote-count mat-icon,
    .percentage mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--primary-color);
    }

    .progress-bar {
      height: 4px;
      background-color: var(--border-color);
      border-radius: 2px;
      margin-top: 12px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s ease;
    }

    .selection-indicator {
      position: absolute;
      top: 12px;
      right: 12px;
    }

    .selection-indicator mat-icon {
      color: var(--primary-color);
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .vote-actions {
      text-align: center;
    }

    .vote-actions button {
      padding: 12px 32px;
      font-size: 1.1rem;
      background-color: var(--primary-color);
      color: white;
    }

    .results-section {
      padding: 32px 0;
    }

    .results-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .results-content h3 {
      margin: 0 0 24px 0;
      color: var(--text-primary);
      font-size: 1.5rem;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
    }

    .result-card {
      background: var(--background-white);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow-light);
      transition: all 0.3s ease;
      border: 2px solid var(--border-color);
    }

    .result-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-medium);
    }

    .result-card.winner {
      border-color: #ffd700;
      background: linear-gradient(135deg, #fffbf0 0%, #fff8e1 100%);
      box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
    }

    .result-image-container {
      position: relative;
      height: 180px;
      overflow: hidden;
    }

    .result-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .rank-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1rem;
      box-shadow: var(--shadow-medium);
    }

    .winner-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 215, 0, 0.9);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-medium);
    }

    .winner-badge mat-icon {
      color: #b8860b;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .result-content {
      padding: 20px;
    }

    .result-header {
      margin-bottom: 16px;
    }

    .result-header h4 {
      margin: 0 0 8px 0;
      color: var(--text-primary);
      font-size: 1.2rem;
      font-weight: 600;
    }

    .result-description {
      margin: 0 0 12px 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .vote-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .vote-count,
    .percentage {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .vote-count mat-icon,
    .percentage mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--primary-color);
    }

    .percentage {
      font-weight: bold;
      color: var(--primary-color);
    }

    .result-progress {
      margin-top: 12px;
    }

    .action-buttons {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    .error-state {
      text-align: center;
      padding: 64px 24px;
      color: var(--text-secondary);
    }

    .error-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .error-state h3 {
      margin: 0 0 8px 0;
      color: var(--text-primary);
    }

    .error-state p {
      margin: 0 0 24px 0;
    }

    @media (max-width: 768px) {
      .header-content,
      .voting-content,
      .results-content {
        padding: 0 16px;
      }

      .poll-info h1 {
        font-size: 2rem;
      }

      .poll-meta {
        flex-direction: column;
        gap: 12px;
      }

      .options-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .results-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .option-image-container,
      .result-image-container {
        height: 150px;
      }

      .option-content {
        padding: 16px;
      }

      .result-content {
        padding: 16px;
      }

      .option-stats {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }

      .vote-details {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }

      .action-buttons {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class PollDetailComponent implements OnInit {
    poll: Poll | null = null;
    selectedOptionId: string | null = null;
    isLoading = false;
    isVoting = false;
    isAuthenticated = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private pollService: PollService,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.authService.isAuthenticated$.subscribe(auth => {
            this.isAuthenticated = auth;
        });

        this.route.params.subscribe(params => {
            const pollId = params['id'];
            if (pollId) {
                this.loadPoll(pollId);
            }
        });
    }

    loadPoll(pollId: string) {
        this.isLoading = true;
        this.pollService.getPoll(pollId).subscribe({
            next: (response) => {
                // 轉換後端 snake_case 欄位為前端 camelCase 欄位
                const poll: any = response.poll;
                this.poll = {
                    ...poll,
                    isActive: poll.is_active,
                    endDate: poll.end_date,
                    createdAt: poll.created_at,
                    startDate: poll.start_date,
                    creatorName: poll.creator_name,
                    totalVotes: poll.totalVotes,
                    hasVotedToday: poll.hasVotedToday,
                    canEdit: poll.canEdit,
                    imageUrl: poll.image_url,
                    options: poll.options || []
                };
                
                this.calculatePercentages();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading poll:', error);
                this.isLoading = false;
                this.snackBar.open('載入投票失敗', '關閉', { duration: 3000 });
            }
        });
    }

    calculatePercentages() {
        if (!this.poll) return;
        
        const totalVotes = this.poll.totalVotes;
        this.poll.options.forEach(option => {
            option.percentage = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;
        });
    }

    selectOption(optionId: string) {
        if (!this.isAuthenticated || this.poll?.hasVotedToday || !this.poll?.isActive) {
            return;
        }
        this.selectedOptionId = optionId;
    }

    submitVote() {
        if (!this.selectedOptionId || !this.poll || this.isVoting) {
            return;
        }

        this.isVoting = true;
        const voteData: VoteRequest = {
            pollId: this.poll.id,
            optionId: this.selectedOptionId
        };

        this.pollService.vote(voteData).subscribe({
            next: () => {
                this.snackBar.open('投票成功！', '關閉', { duration: 3000 });
                this.loadPoll(this.poll!.id); // Reload poll to get updated data
                this.isVoting = false;
            },
            error: (error) => {
                console.error('Error submitting vote:', error);
                this.snackBar.open('投票失敗，請稍後再試', '關閉', { duration: 3000 });
                this.isVoting = false;
            }
        });
    }

    goBack() {
        this.router.navigate(['/polls']);
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

    getStatusColor(): 'primary' | 'warn' | 'accent' {
        if (!this.poll) return 'primary';
        if (!this.poll.isActive) return 'warn';
        if (this.poll.endDate && new Date(this.poll.endDate) < new Date()) return 'warn';
        return 'primary';
    }

    getStatusText(): string {
        if (!this.poll) return '';
        if (!this.poll.isActive) return '已停用';
        if (this.poll.endDate && new Date(this.poll.endDate) < new Date()) return '已結束';
        return '進行中';
    }

    isPollEnded(): boolean {
        if (!this.poll?.endDate) return false;
        return new Date(this.poll.endDate) < new Date();
    }

    isWinner(option: any): boolean {
        if (!this.poll) return false;
        const maxVotes = Math.max(...this.poll.options.map(opt => opt.voteCount));
        return option.voteCount === maxVotes && option.voteCount > 0;
    }

    onImageError(event: any, option: any) {
        console.error('Image failed to load:', option.imageUrl);
        event.target.src = '/assets/default-option-image.svg';
    }
} 