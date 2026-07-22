import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { PlatformAdminService } from './platform-admin.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpdateModuleAccessDto } from './dto/update-module-access.dto';

@ApiTags('platform-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin')
export class PlatformAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) {}

  @Get('clients')
  listClients() {
    return this.platformAdminService.listClients();
  }

  @Patch('clients/:id/subscription')
  updateSubscription(@Param('id') clientId: string, @Body() dto: UpdateSubscriptionDto) {
    return this.platformAdminService.updateSubscriptionStatus(clientId, dto);
  }

  @Patch('clients/:id/modules/:moduleId')
  updateModuleAccess(
    @Param('id') clientId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateModuleAccessDto,
  ) {
    return this.platformAdminService.updateModuleAccess(clientId, moduleId, dto);
  }
}
