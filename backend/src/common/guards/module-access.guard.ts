import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_MODULE_KEY } from '../decorators/require-module.decorator';
import { PrismaService } from '../../prisma/prisma.service';

interface RequestUser {
  clientId: string | null;
}

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleKey = this.reflector.get<string>(
      REQUIRE_MODULE_KEY,
      context.getHandler(),
    );

    // No @RequireModule() on this route -> nothing to check.
    if (!moduleKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: RequestUser }>();
    const clientId = request.user.clientId;

    // TenantScopeGuard (applied alongside this one on every tenant route)
    // already rejects null-clientId and suspended-subscription callers —
    // this guard only needs to check the module grant itself.
    if (!clientId) {
      throw new ForbiddenException('This route requires a client-scoped user');
    }

    const access = await this.prisma.clientModuleAccess.findFirst({
      where: { clientId, module: { key: moduleKey }, enabled: true },
    });
    if (!access) {
      throw new ForbiddenException(
        `Module "${moduleKey}" is not enabled for this client`,
      );
    }

    return true;
  }
}
