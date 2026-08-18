import { apiFetch, getAuthToken, setAuthToken } from './api';

export interface Me {
  userId: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  clientId: string | null;
  modules: string[];
}

interface LoginResponse {
  accessToken: string;
}

interface SignupResponse {
  client: { id: string; name: string };
  accessToken: string;
}

// The current user lives outside React state on purpose: route loaders (see
// requireAuth.ts / requireSuperAdmin.ts) run before any component mounts, so
// they have no hooks/context to read or write to. This tiny store — a value
// plus a subscriber list — is readable and writable from both loaders and
// components. AuthContext below wraps it with useSyncExternalStore so
// components re-render on change, same as Angular's AuthService signal did.
type Listener = () => void;
let currentUser: Me | null = null;
const listeners = new Set<Listener>();

function setUser(user: Me | null): void {
  currentUser = user;
  listeners.forEach((listener) => listener());
}

export function subscribeUser(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getUserSnapshot(): Me | null {
  return currentUser;
}

export function hasToken(): boolean {
  return getAuthToken() !== null;
}

export async function login(email: string, password: string): Promise<void> {
  const res = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setAuthToken(res.accessToken);
}

export async function signup(
  clientName: string,
  adminEmail: string,
  adminPassword: string,
): Promise<void> {
  const res = await apiFetch<SignupResponse>('/clients/signup', {
    method: 'POST',
    body: { clientName, adminEmail, adminPassword },
  });
  setAuthToken(res.accessToken);
}

// Exchanges the httpOnly refresh-token cookie (sent automatically by the
// browser via credentials: 'include') for a new access token. Called by the
// route loaders whenever hasToken() is false but a session might still be
// valid server-side — e.g. right after a page reload wiped the in-memory
// token.
export async function refreshSession(): Promise<void> {
  const res = await apiFetch<LoginResponse>('/auth/refresh', { method: 'POST' });
  setAuthToken(res.accessToken);
}

export async function fetchMe(): Promise<Me> {
  const me = await apiFetch<Me>('/auth/me');
  setUser(me);
  return me;
}

// Revokes the refresh token server-side (so it can't be used even if someone
// captured the cookie) before clearing local state. Best-effort: even if the
// network call fails, we still log out locally.
export async function logout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    setAuthToken(null);
    setUser(null);
  }
}
