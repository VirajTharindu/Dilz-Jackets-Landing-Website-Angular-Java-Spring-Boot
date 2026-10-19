import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface LoginResponse {
    token: string;
    type: string;
    username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private readonly TOKEN_KEY = "dilz_jackets_auth_token";
    private readonly EXPIRY_KEY = "dilz_admin_session_expiry";
    private readonly API_URL = `${environment.apiBaseUrl}/auth`;
    readonly SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minutes

    //reactive state signals for user and loading status
    isloggedIn = signal<boolean>(this.checkInitialAuth());

    private checkInitialAuth(): boolean {
        if (typeof localStorage === 'undefined') return false;
        const token = localStorage.getItem(this.TOKEN_KEY);
        const expiry = localStorage.getItem(this.EXPIRY_KEY);
        if (!token || !expiry) return false;
        if (Date.now() > Number(expiry)) {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.EXPIRY_KEY);
            return false;
        }
        return true;
    }

    isAuthenticated(): boolean {
        if (typeof localStorage === 'undefined') return false;
        const token = this.getToken();
        const expiry = localStorage.getItem(this.EXPIRY_KEY);
        if (!token || !expiry) {
            this.isloggedIn.set(false);
            return false;
        }
        if (Date.now() > Number(expiry)) {
            this.logout();
            return false;
        }
        return true;
    }

    login(credentials: { username: string, password: string }) {
        return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
            tap(res => {
                const expiresAt = Date.now() + this.SESSION_DURATION_MS;
                localStorage.setItem(this.TOKEN_KEY, res.token);
                localStorage.setItem(this.EXPIRY_KEY, expiresAt.toString());
                this.isloggedIn.set(true);
            })
        );
    }

    // Always navigate to the HOMEPAGE on logout or time expiration
    logout() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.EXPIRY_KEY);
        }
        this.isloggedIn.set(false);
        this.router.navigate(['/']);
    }

    getToken(): string | null {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getRemainingSessionMs(): number {
        if (typeof localStorage === 'undefined') return 0;
        const expiry = localStorage.getItem(this.EXPIRY_KEY);
        if (!expiry) return 0;
        return Math.max(0, Number(expiry) - Date.now());
    }

}