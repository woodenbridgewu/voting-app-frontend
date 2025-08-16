import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-register',
    template: `
    <div class="auth-container">
      <div class="auth-card">
        <mat-card>
          <mat-card-header>
            <div mat-card-avatar class="auth-avatar">
              <mat-icon>person_add</mat-icon>
            </div>
            <mat-card-title>註冊</mat-card-title>
            <mat-card-subtitle>加入 VotingApp 開始投票</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>姓名</mat-label>
                <input matInput 
                       type="text" 
                       formControlName="name"
                       placeholder="請輸入您的姓名">
                <mat-icon matSuffix>badge</mat-icon>
                <mat-error *ngIf="registerForm.get('name')?.hasError('required')">
                  姓名是必填的
                </mat-error>
                <mat-error *ngIf="registerForm.get('name')?.hasError('minlength')">
                  姓名至少需要 2 個字元
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput 
                       type="email" 
                       formControlName="email"
                       placeholder="請輸入您的 Email">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                  Email 是必填的
                </mat-error>
                <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                  請輸入有效的 Email 格式
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>密碼</mat-label>
                <input matInput 
                       [type]="hidePassword ? 'password' : 'text'"
                       formControlName="password"
                       placeholder="請輸入密碼 (至少 6 個字元)">
                <button mat-icon-button 
                        matSuffix 
                        type="button"
                        (click)="hidePassword = !hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                  密碼是必填的
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                  密碼至少需要 6 個字元
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>確認密碼</mat-label>
                <input matInput 
                       [type]="hideConfirmPassword ? 'password' : 'text'"
                       formControlName="confirmPassword"
                       placeholder="請再次輸入密碼">
                <button mat-icon-button 
                        matSuffix 
                        type="button"
                        (click)="hideConfirmPassword = !hideConfirmPassword">
                  <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                  請確認您的密碼
                </mat-error>
                <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
                  密碼不一致
                </mat-error>
              </mat-form-field>

              <button mat-raised-button 
                      color="primary" 
                      type="submit"
                      class="full-width auth-submit-btn"
                      [disabled]="registerForm.invalid || isLoading">
                <mat-icon *ngIf="isLoading">hourglass_empty</mat-icon>
                <span *ngIf="!isLoading">註冊</span>
                <span *ngIf="isLoading">註冊中...</span>
              </button>
            </form>
          </mat-card-content>

          <mat-card-actions>
            <div class="auth-actions">
              <p>已經有帳號了？
                <a routerLink="/auth/login" class="auth-link">立即登入</a>
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
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    hidePassword = true;
    hideConfirmPassword = true;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.registerForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    ngOnInit() {
        // Component initialization logic if needed
    }

    passwordMatchValidator(control: AbstractControl) {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        return null;
    }

    onSubmit() {
        if (this.registerForm.valid && !this.isLoading) {
            this.isLoading = true;

            const { confirmPassword, ...registerData } = this.registerForm.value;

            this.authService.register(registerData).subscribe({
                next: (response) => {
                    this.snackBar.open('註冊成功！歡迎加入 VotingApp', '關閉', {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                    });
                    this.router.navigate(['/polls']);
                },
                error: (error) => {
                    console.error('Registration error:', error);
                    const errorMessage = error.error?.error || '註冊失敗，請稍後再試';
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