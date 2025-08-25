import { Component, OnInit, HostListener } from '@angular/core';
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
          
          <!-- Desktop Navigation -->
          <div class="nav-actions desktop-nav">
            <ng-container *ngIf="isAuthenticated$ | async; else authButtons">
              <button mat-button routerLink="/polls" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <mat-icon>list</mat-icon>
                所有投票
              </button>
              <button mat-button routerLink="/polls/my" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <mat-icon>person</mat-icon>
                我的投票
              </button>
              <button mat-button routerLink="/polls/create" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <mat-icon>add</mat-icon>
                創建投票
              </button>
              
              <button mat-icon-button [matMenuTriggerFor]="userMenu">
                <mat-icon>account_circle</mat-icon>
              </button>
              <mat-menu #userMenu="matMenu" class="user-menu">
                <div class="user-info" mat-menu-item>
                  <mat-icon>account_circle</mat-icon>
                  <div class="user-details">
                    <div class="user-name">{{ (currentUser$ | async)?.name }}</div>
                    <div class="user-email">{{ (currentUser$ | async)?.email }}</div>
                  </div>
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
              <button mat-button routerLink="/auth/register">註冊</button>
            </ng-template>
          </div>

          <!-- Mobile Menu Button -->
          <button mat-icon-button class="mobile-menu-btn" (click)="toggleMobileMenu()" *ngIf="isMobile">
            <mat-icon>menu</mat-icon>
          </button>
        </div>
      </mat-toolbar>

      <!-- Mobile Side Navigation -->
      <div class="mobile-menu-overlay" *ngIf="isMobile && mobileMenuOpen" (click)="closeMobileMenu()"></div>
      <div class="mobile-menu-panel" *ngIf="isMobile && mobileMenuOpen">
        <div class="mobile-nav-content">
          <div class="mobile-nav-header">
            <h3>選單</h3>
            <button mat-icon-button (click)="closeMobileMenu()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <mat-nav-list>
            <!-- User Info Section -->
            <ng-container *ngIf="isAuthenticated$ | async">
              <div class="mobile-user-info">
                <mat-icon>account_circle</mat-icon>
                <div class="mobile-user-details">
                  <div class="mobile-user-name">{{ (currentUser$ | async)?.name }}</div>
                  <div class="mobile-user-email">{{ (currentUser$ | async)?.email }}</div>
                </div>
              </div>
              <mat-divider></mat-divider>
            </ng-container>

            <!-- Navigation Items -->
            <ng-container *ngIf="isAuthenticated$ | async; else mobileAuthButtons">
              <a mat-list-item routerLink="/polls" (click)="closeMobileMenu()" routerLinkActive="mobile-active">
                <mat-icon matListItemIcon>list</mat-icon>
                <span matListItemTitle>所有投票</span>
              </a>
              <a mat-list-item routerLink="/polls/my" (click)="closeMobileMenu()" routerLinkActive="mobile-active">
                <mat-icon matListItemIcon>person</mat-icon>
                <span matListItemTitle>我的投票</span>
              </a>
              <a mat-list-item routerLink="/polls/create" (click)="closeMobileMenu()" routerLinkActive="mobile-active">
                <mat-icon matListItemIcon>add</mat-icon>
                <span matListItemTitle>創建投票</span>
              </a>
              <a mat-list-item routerLink="/profile" (click)="closeMobileMenu()" routerLinkActive="mobile-active">
                <mat-icon matListItemIcon>settings</mat-icon>
                <span matListItemTitle>個人設定</span>
              </a>
              <a mat-list-item routerLink="/profile/history" (click)="closeMobileMenu()" routerLinkActive="mobile-active">
                <mat-icon matListItemIcon>history</mat-icon>
                <span matListItemTitle>投票記錄</span>
              </a>
              <mat-divider></mat-divider>
              <a mat-list-item (click)="logoutAndCloseMenu()" class="mobile-logout">
                <mat-icon matListItemIcon>exit_to_app</mat-icon>
                <span matListItemTitle>登出</span>
              </a>
            </ng-container>
            
            <ng-template #mobileAuthButtons>
              <a mat-list-item routerLink="/auth/login" (click)="closeMobileMenu()" routerLinkActive="mobile-active">
                <mat-icon matListItemIcon>login</mat-icon>
                <span matListItemTitle>登入</span>
              </a>
              <a mat-list-item routerLink="/auth/register" (click)="closeMobileMenu()" routerLinkActive="mobile-active">
                <mat-icon matListItemIcon>person_add</mat-icon>
                <span matListItemTitle>註冊</span>
              </a>
            </ng-template>
          </mat-nav-list>
        </div>
      </div>

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
      background-color: var(--background-light);
    }

    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background-color: var(--background-white);
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow-light);
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
      color: var(--primary-color);
    }

    .logo-section:hover {
      opacity: 0.8;
    }

    .app-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
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
      color: var(--text-secondary);
      font-weight: 500;
    }

    .nav-actions button.active {
      color: var(--primary-color);
      background-color: rgba(33, 150, 243, 0.08);
    }

    .mobile-menu-btn {
      display: none;
      color: var(--text-primary);
    }

    .mobile-menu-btn mat-icon {
      color: var(--text-primary);
    }

    .main-content {
      flex: 1;
      background-color: var(--background-light);
    }

    .app-footer {
      background-color: var(--background-white);
      color: var(--text-secondary);
      padding: 16px 0;
      margin-top: auto;
      border-top: 1px solid var(--border-color);
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
      text-align: center;
      font-size: 0.9rem;
    }

    .user-menu {
      min-width: 280px !important;
    }

    .user-info {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 16px !important;
      background-color: var(--background-light) !important;
      pointer-events: none !important;
      min-height: 72px !important;
    }

    .user-info mat-icon {
      font-size: 40px !important;
      width: 40px !important;
      height: 40px !important;
      color: var(--primary-color) !important;
      flex-shrink: 0 !important;
    }

    .user-details {
      flex: 1 !important;
    }

    .user-name {
      font-weight: 500 !important;
      font-size: 1rem !important;
      color: var(--text-primary) !important;
      margin: 0 !important;
    }

    .user-email {
      font-size: 0.9rem !important;
      color: var(--text-secondary) !important;
      margin-top: 2px !important;
      margin-bottom: 0 !important;
    }

    .logout-btn {
      color: var(--accent-color);
    }

    /* Mobile Menu Styles */
    .mobile-menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }

    .mobile-menu-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 280px;
      height: 100vh;
      background-color: var(--background-white);
      box-shadow: var(--shadow-heavy);
      z-index: 1000;
      transform: translateX(100%);
      animation: slideIn 0.3s ease-out forwards;
    }

    @keyframes slideIn {
      to {
        transform: translateX(0);
      }
    }

    .mobile-nav-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .mobile-nav-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px;
      background-color: var(--background-light);
    }

    .mobile-nav-header h3 {
      margin: 0;
      color: var(--text-primary);
      font-weight: 500;
    }

    .mobile-user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background-color: var(--background-light);
    }

    .mobile-user-info mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: var(--primary-color);
    }

    .mobile-user-details {
      flex: 1;
    }

    .mobile-user-name {
      font-weight: 500;
      color: var(--text-primary);
      font-size: 1rem;
    }

    .mobile-user-email {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-top: 2px;
    }

    .mobile-active {
      background-color: rgba(33, 150, 243, 0.08) !important;
      color: var(--primary-color) !important;
    }

    .mobile-logout {
      color: var(--accent-color) !important;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 8px;
      }
      
      .desktop-nav {
        display: none;
      }
      
      .mobile-menu-btn {
        display: block;
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
    isMobile = false;
    mobileMenuOpen = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        this.isAuthenticated$ = this.authService.isAuthenticated$;
        this.currentUser$ = this.authService.currentUser$;
        this.checkScreenSize();
    }

    ngOnInit() {
        // Load user from token when app initializes
        this.authService.loadUserFromToken();
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.checkScreenSize();
    }

    checkScreenSize() {
        this.isMobile = window.innerWidth <= 768;
        if (!this.isMobile) {
            this.mobileMenuOpen = false;
        }
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    closeMobileMenu() {
        this.mobileMenuOpen = false;
    }

    logoutAndCloseMenu() {
        this.closeMobileMenu();
        this.logout();
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