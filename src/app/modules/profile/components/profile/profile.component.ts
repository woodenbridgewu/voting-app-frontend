import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from '../../../../services/auth.service';

@Component({
    selector: 'app-profile',
    template: `
    <div class="profile-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <h1>個人資料</h1>
          <p>管理您的帳戶設定和個人資訊</p>
        </div>
      </div>

      <!-- Content Section -->
      <div class="content-section">
        <div class="content-wrapper">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="loading-section">
            <app-loading-spinner message="載入個人資料中..."></app-loading-spinner>
          </div>

          <!-- Profile Content -->
          <div *ngIf="!isLoading" class="profile-content">
            <!-- Profile Info Card -->
            <div class="profile-card">
              <div class="card-header">
                <div class="avatar-section">
                  <div class="avatar">
                    <mat-icon>person</mat-icon>
                  </div>
                  <div class="user-info">
                    <h3>{{ currentUser?.name }}</h3>
                    <p>{{ currentUser?.email }}</p>
                    <span class="member-since">會員自 {{ formatDate(currentUser?.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Edit Profile Form -->
            <div class="form-card">
              <h3>編輯個人資料</h3>
              
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>姓名 *</mat-label>
                    <input matInput formControlName="name" placeholder="輸入您的姓名">
                    <mat-error *ngIf="profileForm.get('name')?.hasError('required')">
                      姓名為必填項目
                    </mat-error>
                    <mat-error *ngIf="profileForm.get('name')?.hasError('minlength')">
                      姓名至少需要 2 個字元
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>電子郵件</mat-label>
                    <input matInput formControlName="email" type="email" [disabled]="true">
                  </mat-form-field>
                </div>

                <div class="form-actions">
                  <button type="submit" 
                          mat-raised-button 
                          color="primary"
                          [disabled]="!profileForm.valid || isSubmitting">
                    <mat-icon>save</mat-icon>
                    {{ isSubmitting ? '儲存中...' : '儲存變更' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Change Password Form -->
            <div class="form-card">
              <h3>變更密碼</h3>
              
              <form [formGroup]="passwordForm" (ngSubmit)="onPasswordChange()">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>目前密碼 *</mat-label>
                    <input matInput formControlName="currentPassword" 
                           placeholder="輸入目前密碼" 
                           type="password">
                    <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                      目前密碼為必填項目
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>新密碼 *</mat-label>
                    <input matInput formControlName="newPassword" 
                           placeholder="輸入新密碼" 
                           type="password">
                    <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                      新密碼為必填項目
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                      密碼至少需要 6 個字元
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>確認新密碼 *</mat-label>
                    <input matInput formControlName="confirmPassword" 
                           placeholder="再次輸入新密碼" 
                           type="password">
                    <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                      確認密碼為必填項目
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('passwordMismatch')">
                      密碼不一致
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-actions">
                  <button type="submit" 
                          mat-raised-button 
                          color="accent"
                          [disabled]="!passwordForm.valid || isChangingPassword">
                    <mat-icon>lock</mat-icon>
                    {{ isChangingPassword ? '變更中...' : '變更密碼' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Quick Actions -->
            <div class="actions-card">
              <h3>快速操作</h3>
              
              <div class="actions-grid">
                <button mat-button color="primary" routerLink="/profile/history">
                  <mat-icon>history</mat-icon>
                  查看投票歷史
                </button>
                
                <button mat-button color="accent" routerLink="/polls/my">
                  <mat-icon>list</mat-icon>
                  我的投票
                </button>
                
                <button mat-button color="warn" (click)="logout()">
                  <mat-icon>logout</mat-icon>
                  登出
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .profile-container {
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

    .header-info {
      margin-bottom: 24px;
    }

    .header-info h1 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 300;
      color: var(--text-primary);
    }

    .header-info p {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text-secondary);
    }

    .content-section {
      padding: 32px 0;
    }

    .content-wrapper {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .loading-section {
      padding: 64px 0;
      text-align: center;
    }

    .profile-form {
      background: var(--background-white);
      border-radius: 12px;
      padding: 32px;
      box-shadow: var(--shadow-light);
      border: 1px solid var(--border-color);
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: var(--text-primary);
      font-size: 1.3rem;
      font-weight: 500;
    }

    .form-row {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
    }

    .save-btn {
      background-color: var(--primary-color);
      color: white;
      padding: 12px 32px;
      font-size: 1.1rem;
    }

    .cancel-btn {
      color: var(--text-secondary);
    }

    .success-message {
      color: #4caf50;
      font-size: 0.9rem;
      margin-top: 8px;
    }

    .error-message {
      color: var(--accent-color);
      font-size: 0.9rem;
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .header-content,
      .content-wrapper {
        padding: 0 16px;
      }

      .header-info h1 {
        font-size: 2rem;
      }

      .profile-form {
        padding: 20px;
      }

      .form-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .save-btn,
      .cancel-btn {
        width: 100%;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    passwordForm: FormGroup;
    currentUser: User | null = null;
    isLoading = false;
    isSubmitting = false;
    isChangingPassword = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) {
        this.profileForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: [{ value: '', disabled: true }]
        });

        this.passwordForm = this.fb.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit() {
        this.loadUserProfile();
    }

    loadUserProfile() {
        this.isLoading = true;
        this.authService.getUserProfile().subscribe({
            next: (response) => {
                this.currentUser = response.user;
                this.profileForm.patchValue({
                    name: this.currentUser?.name,
                    email: this.currentUser?.email
                });
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading user profile:', error);
                this.isLoading = false;
                this.snackBar.open('載入個人資料失敗', '關閉', { duration: 3000 });
            }
        });
    }

    passwordMatchValidator(form: FormGroup) {
        const newPassword = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        
        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }
        
        return null;
    }

    onSubmit() {
        if (this.profileForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;

            const updateData = {
                name: this.profileForm.get('name')?.value
            };

            this.authService.updateProfile(updateData).subscribe({
                next: () => {
                    this.snackBar.open('個人資料更新成功', '關閉', { duration: 3000 });
                    this.loadUserProfile(); // Reload user data
                    this.isSubmitting = false;
                },
                error: (error) => {
                    console.error('Error updating profile:', error);
                    this.snackBar.open('更新個人資料失敗', '關閉', { duration: 3000 });
                    this.isSubmitting = false;
                }
            });
        }
    }

    onPasswordChange() {
        if (this.passwordForm.valid && !this.isChangingPassword) {
            this.isChangingPassword = true;

            const passwordData = {
                currentPassword: this.passwordForm.get('currentPassword')?.value,
                newPassword: this.passwordForm.get('newPassword')?.value
            };

            this.authService.updateProfile(passwordData).subscribe({
                next: () => {
                    this.snackBar.open('密碼變更成功', '關閉', { duration: 3000 });
                    this.passwordForm.reset();
                    this.isChangingPassword = false;
                },
                error: (error) => {
                    console.error('Error changing password:', error);
                    this.snackBar.open('密碼變更失敗', '關閉', { duration: 3000 });
                    this.isChangingPassword = false;
                }
            });
        }
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => {
                this.snackBar.open('已成功登出', '關閉', { duration: 3000 });
            },
            error: (error) => {
                console.error('Error during logout:', error);
                // Still logout locally even if server logout fails
                this.authService.logout();
            }
        });
    }

    formatDate(date: string | undefined): string {
        if (!date) return '';
        return new Date(date).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
} 