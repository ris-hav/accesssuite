import { createHash, randomBytes } from 'crypto';
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

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Deliberately the same error for "no such user" and "wrong password" —
    // telling an attacker which one it was leaks whether an email is registered.
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createSession(user);
  }

  // Shared by login() and the client-signup flow (which auto-logs-in a
  // freshly created admin without re-checking the password it just set).
  // Issues both tokens: a short-lived access token for API calls, and a
  // long-lived refresh token whose raw value only ever exists here and in
  // the httpOnly cookie the controller sets — never persisted in plaintext,
  // never sent back in a JSON body.
  async createSession(
    user: TokenSubject,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken } = await this.issueAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user.id);
    return { accessToken, refreshToken };
  }

  // Verifies a refresh token from the cookie and issues a brand new session.
  // Rotation: the incoming token is revoked here regardless of outcome further
  // down, so it's single-use — a captured-and-replayed refresh token stops
  // working the moment the legitimate client uses it once.
  async refreshSession(
    rawRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.createSession(stored.user);
  }

  // Used by logout. updateMany (not update) so an already-revoked or
  // unrecognized token doesn't throw — logging out should always succeed
  // from the client's point of view.
  async revokeRefreshToken(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueAccessToken(
    user: TokenSubject,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      clientId: user.clientId,
    };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const raw = randomBytes(64).toString('hex');
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );
    await this.prisma.refreshToken.create({
      data: { tokenHash: this.hashToken(raw), userId, expiresAt },
    });
    return raw;
  }

  // SHA-256, not bcrypt: this token is already 64 random bytes of entropy,
  // not a human-chosen password — there's nothing for a slow hash to defend
  // against here, so a fast cryptographic hash is the right tool.
  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
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
