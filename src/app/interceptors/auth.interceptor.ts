import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Injector } from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private injector: Injector,
        private router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // 透過 Injector 動態獲取 AuthService
        const authService = this.injector.get(AuthService);
        // Get the auth token
        const token = authService.getToken();

        // Clone the request and add the authorization header if token exists
        let authReq = req;
        if (token) {
            authReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`)
            });
        }

        // Handle the request and catch errors
        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                // If 401 error (Unauthorized), logout the user
                if (error.status === 401) {
                    authService.logout().subscribe({
                        complete: () => {
                            this.router.navigate(['/auth/login']);
                        }
                    });
                }

                return throwError(() => error);
            })
        );
    }
}