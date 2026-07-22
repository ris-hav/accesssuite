import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Runs before Angular renders a guarded route. Note this only stops
// *navigation* in the browser — it's a UX nicety, not a security boundary.
// The real enforcement is JwtAuthGuard on the backend; even if someone
// bypassed this guard, every API call would still be rejected without a
// valid token.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
