import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  accessToken: string;
}

export interface SignupResponse {
  client: { id: string; name: string };
  accessToken: string;
}

export interface Me {
  userId: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  clientId: string | null;
  modules: string[];
}

const API_BASE = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // Deliberately in memory only — never localStorage/sessionStorage. Those
  // are readable by any script on the page, so an XSS bug anywhere in the
  // app (or a compromised dependency) could read the token straight out.
  // Tradeoff: a hard page reload clears this and you're logged out again.
  // A production app closes that gap with a short-lived refresh token in an
  // httpOnly cookie (invisible to JS) to silently restore the session — not
  // built yet, since it needs backend support we haven't added.
  private token: string | null = null;

  private readonly currentUser = signal<Me | null>(null);
  readonly user = this.currentUser.asReadonly();

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_BASE}/auth/login`, { email, password })
      .pipe(tap((res) => (this.token = res.accessToken)));
  }

  signup(clientName: string, adminEmail: string, adminPassword: string): Observable<SignupResponse> {
    return this.http
      .post<SignupResponse>(`${API_BASE}/clients/signup`, { clientName, adminEmail, adminPassword })
      .pipe(tap((res) => (this.token = res.accessToken)));
  }

  fetchMe(): Observable<Me> {
    return this.http.get<Me>(`${API_BASE}/auth/me`).pipe(tap((me) => this.currentUser.set(me)));
  }

  logout(): void {
    this.token = null;
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return this.token;
  }

  isLoggedIn(): boolean {
    return this.token !== null;
  }
}
