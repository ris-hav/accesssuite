import { Body, Controller, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { setRefreshTokenCookie } from '../common/refresh-cookie';
import { ClientsService } from './clients.service';
import { SignupDto } from './dto/signup.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  private readonly useSecureCookies: boolean;

  constructor(
    private readonly clientsService: ClientsService,
    configService: ConfigService,
  ) {
    this.useSecureCookies = configService.getOrThrow<string>('NODE_ENV') !== 'development';
  }

  // Deliberately unguarded: this is how a brand-new tenant joins the platform
  // in the first place, so there's no existing token to require yet.
  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const { client, accessToken, refreshToken } = await this.clientsService.signup(dto);
    setRefreshTokenCookie(res, refreshToken, this.useSecureCookies);
    return { client, accessToken };
  }
}
