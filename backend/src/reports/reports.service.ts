import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UsageReport {
  client: { name: string; createdAt: Date };
  subscription: { status: string; trialEndsAt: Date } | null;
  userCounts: Record<'ADMIN' | 'MANAGER' | 'VIEWER', number>;
  enabledModules: string[];
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsageReport(clientId: string): Promise<UsageReport> {
    const [client, subscription, roleCounts, moduleAccess] = await Promise.all([
      this.prisma.client.findUniqueOrThrow({ where: { id: clientId } }),
      this.prisma.subscription.findUnique({ where: { clientId } }),
      this.prisma.user.groupBy({ by: ['role'], where: { clientId }, _count: { _all: true } }),
      this.prisma.clientModuleAccess.findMany({
        where: { clientId, enabled: true },
        include: { module: true },
      }),
    ]);

    const userCounts: UsageReport['userCounts'] = { ADMIN: 0, MANAGER: 0, VIEWER: 0 };
    for (const row of roleCounts) {
      userCounts[row.role] = row._count._all;
    }

    return {
      client: { name: client.name, createdAt: client.createdAt },
      subscription: subscription ? { status: subscription.status, trialEndsAt: subscription.trialEndsAt } : null,
      userCounts,
      enabledModules: moduleAccess.map((a) => a.module.key),
    };
  }
}
