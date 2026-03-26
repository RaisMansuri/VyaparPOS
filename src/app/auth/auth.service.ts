import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { finalize, tap, catchError } from 'rxjs/operators';
import { LoaderService } from '../core/loader.service';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  token?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  joinDate?: string;
  subscriptionPlanId?: string;
  subscriptionPlanName?: string;
  subscriptionStatus?: string;
  subscriptionRenewalDate?: string;
  permissions?: string[];
  aiApiKey?: string;
  aiModel?: string;
  avatarUrl?: string;
  loginTimestamp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'vyaparpos_auth_user';
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private router = inject(Router);
  private loader = inject(LoaderService);

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  private loadUser(): AuthUser | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }
    try {
      const user = JSON.parse(raw) as AuthUser;
      if (this.isSessionExpired(user)) {
        this.logout();
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }

  private saveUser(user: AuthUser | null): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      this.currentUserSubject.next(user);
      return;
    }
    if (!user) {
      window.localStorage.removeItem(this.storageKey);
      this.currentUserSubject.next(null);
      return;
    }

    // Set timestamp if not already present or if new login
    if (!user.loginTimestamp) {
      user.loginTimestamp = Date.now();
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  isSessionExpired(user?: AuthUser | null): boolean {
    const u = user || this.getCurrentUser();
    if (!u || !u.loginTimestamp) return false;

    const oneHour = 60 * 60 * 1000;
    const elapsed = Date.now() - u.loginTimestamp;
    return elapsed > oneHour;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.toLowerCase() === role.toLowerCase();
  }

  isAdmin(): boolean {
    return this.hasRole('admin') || this.hasRole('superadmin') || this.hasRole('owner');
  }

  isSuperAdmin(): boolean {
    return this.hasRole('superadmin') || this.hasRole('owner');
  }

  isInventoryManager(): boolean {
    return this.hasRole('inventory_manager');
  }

  isAccountant(): boolean {
    return this.hasRole('accountant');
  }

  isDeliveryStaff(): boolean {
    return this.hasRole('delivery_staff');
  }

  isManager(): boolean {
    return this.hasRole('manager');
  }

  isCashier(): boolean {
    return this.hasRole('cashier');
  }
  
  isConsumer(): boolean {
    return this.hasRole('consumer') || this.hasRole('customer');
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, {
      headers: { 'X-Skip-Error-Toast': 'true' }
    }).pipe(
      tap((response: any) => {
        const data = response.data;
        const user: AuthUser = {
          ...data.user,
          token: data.token
        };
        this.saveUser(user);
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  register(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, payload).pipe(
      tap((response: any) => {
        const data = response.data;
        if (data && data.token) {
          const user: AuthUser = {
            ...data.user,
            token: data.token
          };
          this.saveUser(user);
        }
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  verifyEmail(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-email`, { email, code }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  resendVerification(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend-verification`, { email }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  updateProfile(updates: Partial<AuthUser>): Observable<any> {
    const current = this.currentUserSubject.value;
    if (!current) return throwError(() => new Error('No user logged in'));

    return this.http.put(`${this.apiUrl}/users/me`, updates).pipe(
      tap((response: any) => {
        const updatedUser = { ...current, ...response.data };
        this.saveUser(updatedUser);
      })
    );
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`).pipe(
      tap((response: any) => {
        const current = this.currentUserSubject.value;
        if (current) {
          const updatedUser = { ...current, ...response.data };
          this.saveUser(updatedUser);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  resetPassword(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, payload).pipe(
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    this.saveUser(null);
    this.router.navigate(['/auth/login']);
  }
}
