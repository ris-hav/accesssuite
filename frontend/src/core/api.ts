const API_BASE = import.meta.env.VITE_API_BASE;

// Deliberately in memory only — never localStorage/sessionStorage. Those are
// readable by any script on the page, so an XSS bug anywhere in the app (or
// a compromised dependency) could read the token straight out. A hard page
// reload still clears this, but refreshSession() (in ./auth) silently
// restores it using the httpOnly refresh-token cookie, which JS can't read
// even in an XSS scenario — so the session survives reloads without the
// access token itself ever touching persistent, script-readable storage.
let authToken: string | null = null;

export function getAuthToken(): string | null {
  return authToken;
}

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

// Every call in the app goes through here. Attaches the bearer token (the
// exact header format JwtStrategy on the backend expects) and always sends
// cookies, since the httpOnly refresh-token cookie has to reach /auth/refresh
// and /auth/logout regardless of which call site triggers it.
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, headers: headerInit, ...rest } = options;
  const headers = new Headers(headerInit);

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  let requestBody: string | undefined;
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body: requestBody,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new ApiError(errorBody?.message ?? res.statusText, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
