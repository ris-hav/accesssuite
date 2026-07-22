import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// Every HttpClient call in the app passes through here before it leaves the
// browser. If we have a token, attach it as `Authorization: Bearer <token>` —
// the exact header format JwtStrategy on the backend expects.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
