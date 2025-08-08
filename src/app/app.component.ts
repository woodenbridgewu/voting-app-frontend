import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, User } from './services/auth.service';

@Component({
    selector: 'app-root',
    template: `
    <div class="app-container">
      <!-- Navigation Header -->
      <mat-toolbar color="primary" class="app-header">
        <div class="header-content">
          <div class="logo-section" (click)="navigateHome()">
            <mat-icon>poll</mat-icon>
            <span class="app-title">VotingApp</span>
          </div>
          
          <div class="nav-actions">
            <ng-container *ngIf="isAuthenticated$ | async; else authButtons">
              <button mat-button routerLink="/polls" routerLinkActive="active">
                <mat-icon>list</mat-icon>
                所有投票
              </button>
              <button mat-button routerLink="/polls/my" routerLinkActive="active">
                <mat-icon>person</mat-icon>
                我的投票
              </button>
              <button mat-button routerLink="/polls/create" routerLinkActive="active">
                <mat-icon>add</mat-icon>
                創建投票
              </button>
              
              <button mat-icon-button [matMenuTriggerFor]="userMenu">
                <mat-icon>account_circle</mat-icon>
              </button>
              <mat-menu #userMenu="matMenu">
                <div class="user-info" mat-menu-item disabled>
                  <div class="user-name">{{ (currentUser$ | async)?.name }}</div>
                  <div class="user-email">{{ (currentUser$ | async)?.email }}</div>
                </div>
                <mat-divider></mat-divider>
                <button mat-menu-item routerLink="/profile">
                  <mat-icon>settings</mat-icon>
                  個人設定
                </button>
                <button mat-menu-item routerLink="/profile/history">
                  <mat-icon>history</mat-icon>
                  投票記錄
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="logout()" class="logout-btn">
                  <mat-icon>exit_to_app</mat-icon>
                  登出
                </button>
              </mat-menu>
            </ng-container>
            
            <ng-template #authButtons>
              <button mat-button routerLink="/auth/login">登入</button>
              <button mat-raised-button color="accent" routerLink="/auth/register">註冊</button>
            </ng-template>
          </div>
        </div>
      </mat-toolbar>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <div class="footer-content">
          <p>&copy; 2025 VotingApp. 讓每一票都算數。</p>
        </div>
      </footer>
    </div>
  `,
    styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .logo-section:hover {
      opacity: 0.8;
    }

    .app-title {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-actions button {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .nav-actions button.active {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .main-content {
      flex: 1;
      background-color: #f5f5f5;
    }

    .app-footer {
      background-color: #333;
      color: white;
      padding: 16px 0;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
      text-align: center;
    }

    .user-info {
      padding: 8px 16px !important;
      pointer-events: none;
    }

    .user-name {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .user-email {
      font-size: 0.8rem;
      color: rgba(0,0,0,0.6);
      margin-top: 2px;
    }

    .logout-btn {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 8px;
      }
      
      .nav-actions button span {
        display: none;
      }
      
      .app-title {
        font-size: 1.1rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
    isAuthenticated$: Observable<boolean>;
    currentUser$: Observable<User | null>;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        this.isAuthenticated$ = this.authService.isAuthenticated$;
        this.currentUser$ = this.authService.currentUser$;
    }

    ngOnInit() {
        // Component initialization logic if needed
    }

    navigateHome() {
        this.router.navigate(['/polls']);
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigate(['/auth/login']);
            },
            error: (error) => {
                console.error('Logout error:', error);
                // Force logout even if API call fails
                this.router.navigate(['/auth/login']);
            }
        });
    }
}