import { Response } from 'express';

export const REFRESH_TOKEN_COOKIE = 'refreshToken';

// Shared by AuthController (login, refresh) and ClientsController (signup —
// which also auto-creates a session) so the cookie is set identically
// everywhere a session gets created.
export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true, // invisible to JavaScript, even via an XSS bug
    sameSite: 'lax',
    secure: false, // dev only (plain HTTP on localhost) — must be true in production (HTTPS)
    path: '/auth', // only sent back on /auth/* requests, not every API call
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/auth' });
}
