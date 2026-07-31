import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpdateModuleAccessDto } from './dto/update-module-access.dto';

@Injectable()
export class PlatformAdminService {
  constructor(private readonly prisma: PrismaService) {}

  listClients() {
    return this.prisma.client.findMany({
      include: {
        subscription: true,
        moduleAccess: { include: { module: true } },
      },
    });
  }

  // The frontend needs the full catalog (not just a client's existing grants)
  // so it can offer a checkbox for every module, even ones a client has never
  // been granted before.
  listModuleCatalog() {
    return this.prisma.moduleCatalog.findMany();
  }

  async updateSubscriptionStatus(clientId: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { clientId },
    });
    if (!subscription) {
      throw new NotFoundException('No subscription found for this client');
    }
    return this.prisma.subscription.update({
      where: { clientId },
      data: { status: dto.status },
    });
  }

  // upsert (not update-only): a client that signed up with zero modules has
  // no ClientModuleAccess row to update yet — this is how a module gets
  // granted for the very first time, not just toggled.
  async updateModuleAccess(
    clientId: string,
    moduleId: string,
    dto: UpdateModuleAccessDto,
  ) {
    try {
      return await this.prisma.clientModuleAccess.upsert({
        where: { clientId_moduleId: { clientId, moduleId } },
        update: { enabled: dto.enabled },
        create: { clientId, moduleId, enabled: dto.enabled },
      });
    } catch (error) {
      // P2003: the create branch's clientId/moduleId columns don't reference
      // an existing row -- the DB's foreign key constraint rejected the insert.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('No such client or module exists');
      }
      throw error;
    }
  }
}
