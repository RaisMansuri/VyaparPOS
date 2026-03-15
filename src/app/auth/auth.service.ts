import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { finalize, tap, catchError } from 'rxjs/operators';
import { LoaderService } from '../core/loader.service';

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
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'vyaparpos_auth_user';
  private readonly apiUrl = 'http://localhost:5000/api/auth';
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
      return JSON.parse(raw) as AuthUser;
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
    window.localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    this.loader.show();
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        const user: AuthUser = {
          ...response.user,
          token: response.token
        };
        this.saveUser(user);
      }),
      catchError(err => {
        return throwError(() => err);
      }),
      finalize(() => this.loader.hide())
    );
  }

  register(payload: any): Observable<any> {
    this.loader.show();
    return this.http.post(`${this.apiUrl}/register`, payload).pipe(
      tap((response: any) => {
        const user: AuthUser = {
          ...response.user,
          token: response.token
        };
        this.saveUser(user);
      }),
      catchError(err => {
        return throwError(() => err);
      }),
      finalize(() => this.loader.hide())
    );
  }

  updateProfile(updates: Partial<AuthUser>): void {
    const current = this.currentUserSubject.value;
    if (current) {
      const updated = { ...current, ...updates };
      this.saveUser(updated);
    }
  }

  logout(): void {
    this.saveUser(null);
    this.router.navigate(['/auth/login']);
  }
}
