import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        // First check if we have a valid token synchronously
        if (this.authService.isTokenValid()) {
            // If we have a valid token but the observable hasn't been set yet,
            // try to load the user from token
            if (!this.authService.isAuthenticated()) {
                this.authService.loadUserFromToken();
            }
        }

        return this.authService.isAuthenticated$.pipe(
            take(1),
            map(isAuthenticated => {
                if (isAuthenticated) {
                    return true;
                } else {
                    this.router.navigate(['/auth/login'], {
                        queryParams: { returnUrl: state.url }
                    });
                    return false;
                }
            })
        );
    }
}

@Injectable({
    providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(): Observable<boolean> {
        return this.authService.isAuthenticated$.pipe(
            take(1),
            map(isAuthenticated => {
                if (!isAuthenticated) {
                    return true;
                } else {
                    this.router.navigate(['/polls']);
                    return false;
                }
            })
        );
    }
}