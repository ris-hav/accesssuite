import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { UpdateClientDto } from './dto/update-client.dto';

const TRIAL_LENGTH_DAYS = 14;

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async signup(dto: SignupDto) {
    // Hashing is CPU-bound and doesn't touch the DB — do it before opening the
    // transaction so we're not holding a DB transaction (and its locks) open
    // any longer than necessary.
    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

    try {
      const { client, adminUser } = await this.prisma.$transaction(async (tx) => {
        const client = await tx.client.create({
          data: { name: dto.clientName },
        });

        await tx.subscription.create({
          data: {
            clientId: client.id,
            trialEndsAt: new Date(Date.now() + TRIAL_LENGTH_DAYS * 24 * 60 * 60 * 1000),
          },
        });

        const adminUser = await tx.user.create({
          data: {
            email: dto.adminEmail,
            passwordHash,
            role: 'ADMIN',
            clientId: client.id,
          },
        });

        return { client, adminUser };
      });

      // Auto-login: the caller just proved they own this email/password by
      // choosing it in the signup form, so re-verifying via login() is redundant.
      const { accessToken, refreshToken } = await this.authService.createSession(adminUser);

      return {
        client: { id: client.id, name: client.name },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // P2002 is Prisma's unique-constraint-violation code. The only unique
      // field this transaction writes to is User.email, so if we hit P2002
      // here, it's always "that email is already registered".
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('An account with that email already exists');
      }
      throw error;
    }
  }

  getMyClient(clientId: string) {
    return this.prisma.client.findUniqueOrThrow({
      where: { id: clientId },
      select: { id: true, name: true, createdAt: true },
    });
  }

  updateMyClient(clientId: string, dto: UpdateClientDto) {
    return this.prisma.client.update({
      where: { id: clientId },
      data: { name: dto.name },
      select: { id: true, name: true, createdAt: true },
    });
  }
}
