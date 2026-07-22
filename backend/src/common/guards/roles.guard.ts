import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface RequestUser {
  role: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Reads whatever @Roles(...) set on this specific route handler.
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());

    // No @Roles() on this route at all -> no restriction, allow through.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: RequestUser }>();
    if (!requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException(`Requires one of these roles: ${requiredRoles.join(', ')}`);
    }
    return true;
  }
}
