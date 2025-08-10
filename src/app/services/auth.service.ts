import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL = environment.apiUrl;
    private readonly TOKEN_KEY = 'voting_app_token';

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        // Don't call loadUserFromToken here, let the component call it
    }

    public loadUserFromToken(): void {
        const token = this.getToken();
        if (token) {
            console.log('Found token in localStorage, checking validity...');
            
            // Check if token is expired before making API call
            if (this.isTokenExpired(token)) {
                console.warn('Token is expired, clearing auth data');
                this.clearAuthData();
                return;
            }

            console.log('Token is valid, fetching user profile...');
            this.getUserProfile().subscribe({
                next: (response) => {
                    console.log('User profile loaded successfully:', response.user.name);
                    this.currentUserSubject.next(response.user);
                    this.isAuthenticatedSubject.next(true);
                    // Set up token refresh timer
                    this.setupTokenRefresh(token);
                },
                error: (error) => {
                    console.warn('Token validation failed:', error);
                    // Only logout if it's a 401 error (unauthorized)
                    // For other errors (like network issues), keep the token
                    if (error.status === 401) {
                        console.warn('401 error, clearing auth data');
                        this.clearAuthData();
                    } else {
                        console.warn('Non-401 error, keeping token:', error.status);
                    }
                }
            });
        } else {
            console.log('No token found in localStorage');
        }
    }

    private isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            // Only consider token expired if it's actually expired
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error parsing token:', error);
            return true;
        }
    }

    private setupTokenRefresh(token: string): void {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = payload.exp - currentTime;
            
            // Refresh token 1 hour before expiry
            const refreshTime = Math.max(timeUntilExpiry - 3600, 60000); // At least 1 minute
            
            console.log(`Token will expire in ${timeUntilExpiry} seconds, setting refresh in ${refreshTime} seconds`);
            
            setTimeout(() => {
                console.log('Refreshing token...');
                this.refreshToken();
            }, refreshTime * 1000);
        } catch (error) {
            console.error('Error setting up token refresh:', error);
        }
    }

    private refreshToken(): void {
        const token = this.getToken();
        if (!token) return;

        // Call refresh endpoint
        this.http.post<AuthResponse>(`${this.API_URL}/auth/refresh`, {})
            .pipe(
                tap(response => {
                    this.setToken(response.token);
                    this.setupTokenRefresh(response.token);
                })
            )
            .subscribe({
                error: (error) => {
                    console.warn('Token refresh failed:', error);
                    // If refresh fails, logout user
                    this.clearAuthData();
                }
            });
    }

    register(userData: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
            .pipe(
                tap(response => {
                    this.setToken(response.token);
                    this.currentUserSubject.next(response.user);
                    this.isAuthenticatedSubject.next(true);
                    this.setupTokenRefresh(response.token);
                })
            );
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
            .pipe(
                tap(response => {
                    this.setToken(response.token);
                    this.currentUserSubject.next(response.user);
                    this.isAuthenticatedSubject.next(true);
                    this.setupTokenRefresh(response.token);
                })
            );
    }

    logout(): Observable<any> {
        return this.http.post(`${this.API_URL}/auth/logout`, {})
            .pipe(
                tap(() => {
                    this.clearAuthData();
                    this.router.navigate(['/auth/login']);
                })
            );
    }

    getUserProfile(): Observable<{ user: User }> {
        return this.http.get<{ user: User }>(`${this.API_URL}/auth/profile`);
    }

    updateProfile(userData: Partial<User> & { currentPassword?: string; newPassword?: string }): Observable<any> {
        return this.http.put(`${this.API_URL}/auth/profile`, userData)
            .pipe(
                tap((response: any) => {
                    if (response.user) {
                        this.currentUserSubject.next(response.user);
                    }
                })
            );
    }

    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(this.TOKEN_KEY);
        }
        return null;
    }

    private setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.TOKEN_KEY, token);
        }
    }

    private clearAuthData(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.TOKEN_KEY);
        }
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
    }

    isAuthenticated(): boolean {
        return this.isAuthenticatedSubject.value;
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    // Check if current token is valid
    isTokenValid(): boolean {
        const token = this.getToken();
        if (!token) return false;
        return !this.isTokenExpired(token);
    }
}