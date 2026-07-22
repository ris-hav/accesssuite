import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpdateModuleAccessDto } from './dto/update-module-access.dto';

@Injectable()
export class PlatformAdminService {
  constructor(private readonly prisma: PrismaService) {}

  listClients() {
    return this.prisma.client.findMany({
      include: { subscription: true, moduleAccess: { include: { module: true } } },
    });
  }

  async updateSubscriptionStatus(clientId: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.prisma.subscription.findUnique({ where: { clientId } });
    if (!subscription) {
      throw new NotFoundException('No subscription found for this client');
    }
    return this.prisma.subscription.update({
      where: { clientId },
      data: { status: dto.status },
    });
  }

  async updateModuleAccess(clientId: string, moduleId: string, dto: UpdateModuleAccessDto) {
    const access = await this.prisma.clientModuleAccess.findUnique({
      where: { clientId_moduleId: { clientId, moduleId } },
    });
    if (!access) {
      throw new NotFoundException('No such module grant exists for this client');
    }
    return this.prisma.clientModuleAccess.update({
      where: { clientId_moduleId: { clientId, moduleId } },
      data: { enabled: dto.enabled },
    });
  }
}
