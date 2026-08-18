import { redirect } from 'react-router-dom';
import { hasToken, refreshSession } from './auth';

// Route loader — the React Router equivalent of Angular's canActivate guard.
// Runs before the route's element renders, so it can redirect before
// anything is shown. Note this only stops *navigation* in the browser — it's
// a UX nicety, not a security boundary. The real enforcement is the
// JwtAuthGuard on the backend; even if someone bypassed this loader, every
// API call would still be rejected without a valid token.
export async function requireAuthLoader() {
  if (hasToken()) {
    return null;
  }

  // No in-memory token — likely a fresh page reload. Before giving up, try
  // exchanging the httpOnly refresh cookie for a new access token; only
  // redirect to /login if that fails too (no valid session at all).
  try {
    await refreshSession();
    return null;
  } catch {
    return redirect('/login');
  }
}
