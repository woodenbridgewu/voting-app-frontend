import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-login',
    template: `
    <div class="auth-container">
      <div class="auth-card">
        <mat-card>
          <mat-card-header>
            <div mat-card-avatar class="auth-avatar">
              <mat-icon>person</mat-icon>
            </div>
            <mat-card-title>登入</mat-card-title>
            <mat-card-subtitle>歡迎回到 VotingApp</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput 
                       type="email" 
                       formControlName="email"
                       placeholder="請輸入您的 Email">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                  Email 是必填的
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                  請輸入有效的 Email 格式
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>密碼</mat-label>
                <input matInput 
                       [type]="hidePassword ? 'password' : 'text'"
                       formControlName="password"
                       placeholder="請輸入您的密碼">
                <button mat-icon-button 
                        matSuffix 
                        type="button"
                        (click)="hidePassword = !hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  密碼是必填的
                </mat-error>
              </mat-form-field>

              <button mat-raised-button 
                      color="primary" 
                      type="submit"
                      class="full-width auth-submit-btn"
                      [disabled]="loginForm.invalid || isLoading">
                <mat-icon *ngIf="isLoading">hourglass_empty</mat-icon>
                <span *ngIf="!isLoading">登入</span>
                <span *ngIf="isLoading">登入中...</span>
              </button>
            </form>
          </mat-card-content>

          <mat-card-actions>
            <div class="auth-actions">
              <p>還沒有帳號？
                <a routerLink="/auth/register" class="auth-link">立即註冊</a>
              </p>
            </div>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--background-light);
      padding: 20px;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
    }

    .auth-avatar {
      background-color: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    .auth-submit-btn {
      margin-top: 16px;
      height: 48px;
      font-size: 16px;
      background-color: var(--primary-color);
      color: white;
    }

    .auth-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      text-align: center;
    }

    .auth-actions p {
      margin: 0;
      color: var(--text-secondary);
    }

    .auth-link {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }

    .auth-link:hover {
      text-decoration: underline;
    }

    mat-card {
      box-shadow: var(--shadow-medium);
      border: 1px solid var(--border-color);
    }

    @media (max-width: 480px) {
      .auth-container {
        padding: 16px;
      }
      
      .auth-card {
        max-width: 100%;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    hidePassword = true;
    isLoading = false;
    returnUrl: string = '/polls';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });
    }

    ngOnInit() {
        // Get return url from route parameters or default to '/polls'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/polls';
    }

    onSubmit() {
        if (this.loginForm.valid && !this.isLoading) {
            this.isLoading = true;

            this.authService.login(this.loginForm.value).subscribe({
                next: (response) => {
                    this.snackBar.open('登入成功！', '關閉', {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                    });
                    this.router.navigate([this.returnUrl]);
                },
                error: (error) => {
                    console.error('Login error:', error);
                    const errorMessage = error.error?.error || '登入失敗，請檢查您的帳號密碼';
                    this.snackBar.open(errorMessage, '關閉', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                    this.isLoading = false;
                }
            });
        }
    }
}