import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

// Re-fetches /auth/me rather than trusting a cached signal — a super-admin
// flag revoked mid-session should take effect on the very next navigation,
// not just after the next login.
export const superAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Same reload gap as authGuard: no in-memory token yet doesn't mean no
  // valid session — try the refresh cookie first.
  const ensureLoggedIn$: Observable<unknown> = authService.isLoggedIn() ? of(null) : authService.refresh();

  return ensureLoggedIn$.pipe(
    switchMap(() => authService.fetchMe()),
    map((me) => {
      if (me.isSuperAdmin) {
        return true;
      }
      router.navigate(['/dashboard']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    }),
  );
};
