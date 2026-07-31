import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  REFRESH_TOKEN_COOKIE,
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from '../common/refresh-cookie';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  // Local dev runs on plain HTTP, so the cookie can't have `secure: true`
  // there (the browser would refuse to store it). Staging/production serve
  // over HTTPS, where it always should.
  private readonly useSecureCookies: boolean;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.useSecureCookies =
      configService.getOrThrow<string>('NODE_ENV') !== 'development';
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    setRefreshTokenCookie(res, refreshToken, this.useSecureCookies);
    // The refresh token is never returned in the JSON body — the httpOnly
    // cookie is its only channel, precisely so client-side JS can't read it.
    return { accessToken };
  }

  // Called on app startup (and whenever an access token has expired) to
  // silently restore a session using the httpOnly cookie the browser sends
  // automatically — no credentials re-entered, no visible redirect.
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request & { cookies: Record<string, string> },
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    if (!rawRefreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshSession(rawRefreshToken);
    setRefreshTokenCookie(res, refreshToken, this.useSecureCookies);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request & { cookies: Record<string, string> },
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    if (rawRefreshToken) {
      await this.authService.revokeRefreshToken(rawRefreshToken);
    }
    clearRefreshTokenCookie(res, this.useSecureCookies);
    return { success: true };
  }

  // Gives the frontend a way to fetch "who am I, and what can I see" from a
  // token alone — the dashboard renders its module tiles from this response.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(
    @Req()
    req: Request & {
      user: {
        userId: string;
        email: string;
        role: string;
        isSuperAdmin: boolean;
        clientId: string | null;
      };
    },
  ) {
    return this.authService.getMe(req.user);
  }
}
