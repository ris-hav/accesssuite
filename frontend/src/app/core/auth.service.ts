import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // Deliberately in memory only — never localStorage/sessionStorage. Those
  // are readable by any script on the page, so an XSS bug anywhere in the
  // app (or a compromised dependency) could read the token straight out.
  // A hard page reload still clears this, but refresh() (below) silently
  // restores it using the httpOnly refresh-token cookie, which JS can't
  // read even in an XSS scenario — so the session survives reloads without
  // the access token itself ever touching persistent, script-readable storage.
  private token: string | null = null;

  private readonly currentUser = signal<Me | null>(null);
  readonly user = this.currentUser.asReadonly();

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBase}/auth/login`, { email, password }, { withCredentials: true })
      .pipe(tap((res) => (this.token = res.accessToken)));
  }

  signup(clientName: string, adminEmail: string, adminPassword: string): Observable<SignupResponse> {
    return this.http
      .post<SignupResponse>(
        `${environment.apiBase}/clients/signup`,
        { clientName, adminEmail, adminPassword },
        { withCredentials: true },
      )
      .pipe(tap((res) => (this.token = res.accessToken)));
  }

  // Exchanges the httpOnly refresh-token cookie (sent automatically by the
  // browser via withCredentials) for a new access token. The guards call
  // this whenever isLoggedIn() is false but a session might still be valid
  // server-side — e.g. right after a page reload wiped our in-memory token.
  refresh(): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBase}/auth/refresh`, {}, { withCredentials: true })
      .pipe(tap((res) => (this.token = res.accessToken)));
  }

  fetchMe(): Observable<Me> {
    return this.http.get<Me>(`${environment.apiBase}/auth/me`).pipe(tap((me) => this.currentUser.set(me)));
  }

  // Revokes the refresh token server-side (so it can't be used even if
  // someone captured the cookie) before clearing local state. Best-effort:
  // even if the network call fails, we still log out locally.
  logout(): Observable<void> {
    return this.http.post(`${environment.apiBase}/auth/logout`, {}, { withCredentials: true }).pipe(
      map(() => undefined),
      tap(() => this.clearLocalSession()),
      catchError(() => {
        this.clearLocalSession();
        return of(undefined);
      }),
    );
  }

  private clearLocalSession(): void {
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
