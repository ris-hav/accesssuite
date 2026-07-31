import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface RequestUser {
  clientId: string | null;
}

// Runs after JwtAuthGuard, so req.user already exists. Blocks two cases:
// callers with no clientId (super-admins, on routes meant only for a
// client's own users), and callers whose client's subscription is
// suspended — this is what makes a suspension lock out *every* tenant
// route, not just module-gated ones like ModuleAccessGuard's checks.
@Injectable()
export class TenantScopeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user: RequestUser }>();
    const clientId = request.user.clientId;

    if (!clientId) {
      throw new ForbiddenException('This route requires a client-scoped user');
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { clientId },
    });
    if (!subscription || subscription.status === 'SUSPENDED') {
      throw new ForbiddenException("This client's subscription is suspended");
    }

    return true;
  }
}
