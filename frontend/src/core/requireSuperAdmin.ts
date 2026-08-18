import { redirect } from 'react-router-dom';
import { hasToken, refreshSession, fetchMe } from './auth';

// Re-fetches /auth/me rather than trusting cached state — a super-admin flag
// revoked mid-session should take effect on the very next navigation, not
// just after the next login.
export async function requireSuperAdminLoader() {
  try {
    // Same reload gap as requireAuthLoader: no in-memory token yet doesn't
    // mean no valid session — try the refresh cookie first.
    if (!hasToken()) {
      await refreshSession();
    }
    const me = await fetchMe();
    if (me.isSuperAdmin) {
      return null;
    }
    return redirect('/dashboard');
  } catch {
    return redirect('/login');
  }
}
