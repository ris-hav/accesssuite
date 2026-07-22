import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

interface TokenSubject {
  id: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  clientId: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    // Deliberately the same error for "no such user" and "wrong password" —
    // telling an attacker which one it was leaks whether an email is registered.
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueToken(user);
  }

  // Shared by login() and the client-signup flow (which auto-logs-in a
  // freshly created admin without re-checking the password it just set).
  async issueToken(user: TokenSubject): Promise<{ accessToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      clientId: user.clientId,
    };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  // Powers GET /auth/me. Beyond the JWT's own contents, the frontend also
  // needs to know which modules to render — that's a live DB fact (an admin
  // could revoke one between page loads), not something safe to bake into
  // the token itself.
  async getMe(jwtUser: {
    userId: string;
    email: string;
    role: string;
    isSuperAdmin: boolean;
    clientId: string | null;
  }) {
    if (!jwtUser.clientId) {
      return { ...jwtUser, modules: [] };
    }

    const access = await this.prisma.clientModuleAccess.findMany({
      where: { clientId: jwtUser.clientId, enabled: true },
      include: { module: true },
    });

    return { ...jwtUser, modules: access.map((a) => a.module.key) };
  }
}
