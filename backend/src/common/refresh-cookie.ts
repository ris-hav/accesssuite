import { Response } from 'express';

export const REFRESH_TOKEN_COOKIE = 'refreshToken';

// Shared by AuthController (login, refresh) and ClientsController (signup —
// which also auto-creates a session) so the cookie is set identically
// everywhere a session gets created.
export function setRefreshTokenCookie(
  res: Response,
  token: string,
  secure: boolean,
): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true, // invisible to JavaScript, even via an XSS bug
    // 'none' is required for the cookie to be sent on cross-origin fetch/XHR
    // calls (frontend and backend live on different domains in staging/prod)
    // — browsers only accept 'none' when paired with `secure: true`, which
    // is exactly when this flips. 'lax' stays for local dev (plain HTTP,
    // same-origin-ish via proxy), where 'none' would be rejected outright.
    sameSite: secure ? 'none' : 'lax',
    secure, // false only in local dev (plain HTTP); staging/production serve over HTTPS
    path: '/auth', // only sent back on /auth/* requests, not every API call
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshTokenCookie(res: Response, secure: boolean): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    path: '/auth',
    secure,
    sameSite: secure ? 'none' : 'lax',
  });
}
