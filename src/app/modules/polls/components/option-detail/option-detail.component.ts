import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PollService, PollOption, VoteRequest, PollOptionImage } from '../../../../services/poll.service';
import { AuthService } from '../../../../services/auth.service';
import { SharedModule } from '../../../../shared/shared.module';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-option-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  template: `
    <div class="option-detail-container">
      <div *ngIf="isLoading" class="loading-section">
        <app-loading-spinner message="載入選項詳情中..."></app-loading-spinner>
      </div>

      <div *ngIf="!isLoading && option" class="detail-content">
        <div class="back-button">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
        </div>

        <div class="main-layout">
          <!-- Left: Image Gallery -->
          <div class="image-gallery">
            <div class="main-image-container">
              <img [src]="selectedImageUrl" [alt]="option.text" class="main-image">
            </div>
            <div *ngIf="option.images && option.images.length > 1" class="thumbnail-container">
              <img *ngFor="let image of option.images" 
                   [src]="image.url" 
                   [alt]="option.text + ' thumbnail'"
                   class="thumbnail-image"
                   [class.active]="image.url === selectedImageUrl"
                   (click)="selectImage(image)">
            </div>
          </div>

          <!-- Right: Details -->
          <div class="option-details">
            <div>
              <h1>{{ option.text }}</h1>
              <p *ngIf="option.description" class="description">{{ option.description }}</p>
            </div>

            <div class="option-footer">
              <div class="stats">
                <div class="stat-item">
                  <mat-icon>how_to_vote</mat-icon>
                  <span>{{ option.voteCount }} 票</span>
                </div>
                <div class="stat-item">
                  <mat-icon>pie_chart</mat-icon>
                  <span>{{ option.percentage || 0 }}%</span>
                </div>
              </div>

              <div class="actions" *ngIf="isAuthenticated$ | async">
                <button mat-raised-button 
                        color="primary" 
                        (click)="submitVote()" 
                        [disabled]="isVoting">
                  <mat-icon>how_to_vote</mat-icon>
                  {{ isVoting ? '投票中...' : '為此選項投票' }}
                </button>
              </div>
              <div *ngIf="!(isAuthenticated$ | async)" class="auth-required">
                  <mat-icon>lock</mat-icon>
                  <p>請先<a routerLink="/auth/login">登入</a>以進行投票。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && !option" class="error-state">
        <mat-icon>error</mat-icon>
        <h3>找不到選項</h3>
        <p>您要查看的選項可能已被刪除或不存在。</p>
        <button mat-raised-button color="primary" (click)="goBack()">返回</button>
      </div>
    </div>
  `,
  styles: [`
    .option-detail-container {
      max-width: 1200px;
      margin: 32px auto;
      padding: 24px;
      background-color: var(--background-white);
      border-radius: 16px;
      box-shadow: var(--shadow-heavy);
    }
    .loading-section, .error-state {
      text-align: center;
      padding: 64px 0;
    }
    .error-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .back-button {
      margin-bottom: 24px;
    }
    .main-layout {
      display: flex;
      gap: 40px;
    }
    .image-gallery {
      flex: 1;
      max-width: 50%;
    }
    .main-image-container {
      width: 100%;
      padding-top: 75%; /* 4:3 Aspect Ratio */
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      background-color: var(--background-light);
      box-shadow: var(--shadow-medium);
    }
    .main-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .thumbnail-container {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    .thumbnail-image {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }
    .thumbnail-image:hover {
      border-color: var(--primary-color-light);
    }
    .thumbnail-image.active {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-light);
    }
    .option-details {
      flex: 1;
      max-width: 50%;
    }
    h1 {
      font-size: 2.2rem;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .description {
      font-size: 1.1rem;
      line-height: 1.6;
      color: var(--text-secondary);
      margin-bottom: 24px;
    }
    .stats {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      padding: 16px;
      background-color: var(--background-light);
      border-radius: 8px;
    }
    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.1rem;
    }
    .stat-item mat-icon {
      color: var(--primary-color);
    }
    .actions {
      margin-top: 0; /* Reset margin for footer layout */
    }
    .actions button {
      width: 100%;
      padding: 12px 0;
      font-size: 1.1rem;
    }
    .auth-required {
        margin-top: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-secondary);
    }
    @media (max-width: 768px) {
      .main-layout {
        flex-direction: column;
      }
      .image-gallery, .option-details {
        max-width: 100%;
      }
    }
    @media (min-width: 769px) {
      .option-details {
        display: flex;
        flex-direction: column;
      }
      .option-footer {
        margin-top: auto;
        padding-top: 24px; /* Add spacing from description */
      }
    }
  `]
})
export class OptionDetailComponent implements OnInit {
  option: PollOption | null = null;
  selectedImageUrl: string | null = null;
  isLoading = false;
  isVoting = false;
  isAuthenticated$: Observable<boolean>;

  private pollId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pollService: PollService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.pollId = params['pollId'];
      const optionId = params['optionId'];
      if (this.pollId && optionId) {
        this.loadOption(this.pollId, optionId);
      }
    });
  }

  loadOption(pollId: string, optionId: string) {
    this.isLoading = true;
    this.pollService.getPollOption(pollId, optionId).subscribe({
      next: (option) => {
        this.option = option;
        if (option.images && option.images.length > 0) {
          const primary = option.images.find(img => img.isPrimary);
          this.selectedImageUrl = primary ? primary.url : option.images[0].url;
        } else {
            this.selectedImageUrl = '/assets/default-option-image.svg';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading poll option:', error);
        this.isLoading = false;
        this.snackBar.open('載入選項詳情失敗', '關閉', { duration: 3000 });
      }
    });
  }

  selectImage(image: PollOptionImage) {
    this.selectedImageUrl = image.url;
  }

  submitVote() {
    if (!this.option || this.isVoting) {
      return;
    }

    this.isVoting = true;
    const voteData: VoteRequest = {
      pollId: this.pollId,
      optionId: this.option.id
    };

    this.pollService.vote(voteData).subscribe({
      next: () => {
        this.snackBar.open('投票成功！', '關閉', { duration: 3000 });
        // Reload option to get updated vote count
        this.loadOption(this.pollId, this.option!.id); 
        this.isVoting = false;
      },
      error: (error) => {
        console.error('Error submitting vote:', error);
        this.snackBar.open(error.error?.error || '投票失敗，請稍後再試', '關閉', { duration: 3000 });
        this.isVoting = false;
      }
    });
  }

  goBack() {
    // Navigate back to the poll detail page
    this.router.navigate(['/polls', this.pollId]);
  }
}