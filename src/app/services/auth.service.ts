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
        this.loadUserFromToken();
    }

    private loadUserFromToken(): void {
        const token = this.getToken();
        if (token) {
            this.getUserProfile().subscribe({
                next: (response) => {
                    this.currentUserSubject.next(response.user);
                    this.isAuthenticatedSubject.next(true);
                },
                error: (error) => {
                    console.warn('Token validation failed:', error);
                    // Only logout if it's a 401 error (unauthorized)
                    // For other errors (like network issues), keep the token
                    if (error.status === 401) {
                        this.clearAuthData();
                    }
                }
            });
        }
    }

    register(userData: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
            .pipe(
                tap(response => {
                    this.setToken(response.token);
                    this.currentUserSubject.next(response.user);
                    this.isAuthenticatedSubject.next(true);
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
}