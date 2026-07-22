import { ForbiddenException, Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

interface RequestUser {
  clientId: string | null;
}

// Runs after JwtAuthGuard, so req.user already exists. This guard's one job:
// block callers with no clientId (i.e. super-admins) from routes meant only
// for a client's own users. Super-admin-only routes live under their own
// guard instead of this one.
@Injectable()
export class TenantScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: RequestUser }>();
    if (!request.user.clientId) {
      throw new ForbiddenException('This route requires a client-scoped user');
    }
    return true;
  }
}
