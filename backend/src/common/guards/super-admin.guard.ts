import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

interface RequestUser {
  isSuperAdmin: boolean;
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: RequestUser }>();
    if (!request.user.isSuperAdmin) {
      throw new ForbiddenException('This route requires a super-admin');
    }
    return true;
  }
}
