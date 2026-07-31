import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequireModule } from '../common/decorators/require-module.decorator';
import { setRefreshTokenCookie } from '../common/refresh-cookie';
import { ClientsService } from './clients.service';
import { SignupDto } from './dto/signup.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  private readonly useSecureCookies: boolean;

  constructor(
    private readonly clientsService: ClientsService,
    configService: ConfigService,
  ) {
    this.useSecureCookies =
      configService.getOrThrow<string>('NODE_ENV') !== 'development';
  }

  // Deliberately unguarded: this is how a brand-new tenant joins the platform
  // in the first place, so there's no existing token to require yet.
  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { client, accessToken, refreshToken } =
      await this.clientsService.signup(dto);
    setRefreshTokenCookie(res, refreshToken, this.useSecureCookies);
    return { client, accessToken };
  }

  // "Settings" is one of the three seeded modules (dashboard/reports/settings)
  // a platform admin can grant or revoke per client -- unlike Team, this one
  // stays module-gated, matching the plan's original intent for it.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantScopeGuard, RolesGuard, ModuleAccessGuard)
  @Get('me')
  @Roles('ADMIN', 'MANAGER')
  @RequireModule('settings')
  getMyClient(@Req() req: Request & { user: { clientId: string } }) {
    return this.clientsService.getMyClient(req.user.clientId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantScopeGuard, RolesGuard, ModuleAccessGuard)
  @Patch('me')
  @Roles('ADMIN')
  @RequireModule('settings')
  updateMyClient(
    @Req() req: Request & { user: { clientId: string } },
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.updateMyClient(req.user.clientId, dto);
  }
}
