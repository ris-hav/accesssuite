import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  listForClient(clientId: string) {
    return this.prisma.user.findMany({
      where: { clientId },
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createForClient(clientId: string, dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: { email: dto.email, passwordHash, role: dto.role, clientId },
        select: { id: true, email: true, role: true, createdAt: true },
      });
      return user;
    } catch (error) {
      // Same email-uniqueness conflict as client signup — email is unique
      // across the whole platform, not just within one client.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with that email already exists',
        );
      }
      throw error;
    }
  }

  async deleteFromClient(
    clientId: string,
    targetUserId: string,
    callerUserId: string,
  ): Promise<void> {
    if (targetUserId === callerUserId) {
      throw new BadRequestException('You cannot remove your own account');
    }

    // findFirst (not findUnique on id alone) so this also enforces tenant
    // isolation: a user id that belongs to a *different* client 404s here,
    // rather than letting one client's admin delete another client's user.
    const target = await this.prisma.user.findFirst({
      where: { id: targetUserId, clientId },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException('No such user on this client');
    }

    await this.prisma.user.delete({ where: { id: targetUserId } });
  }
}
