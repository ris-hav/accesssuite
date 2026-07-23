import { ConflictException, Injectable } from '@nestjs/common';
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
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('An account with that email already exists');
      }
      throw error;
    }
  }
}
