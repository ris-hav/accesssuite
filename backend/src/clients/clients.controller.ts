import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { setRefreshTokenCookie } from '../common/refresh-cookie';
import { ClientsService } from './clients.service';
import { SignupDto } from './dto/signup.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // Deliberately unguarded: this is how a brand-new tenant joins the platform
  // in the first place, so there's no existing token to require yet.
  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const { client, accessToken, refreshToken } = await this.clientsService.signup(dto);
    setRefreshTokenCookie(res, refreshToken);
    return { client, accessToken };
  }
}
