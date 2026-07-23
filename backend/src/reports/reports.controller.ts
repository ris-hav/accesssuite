import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequireModule } from '../common/decorators/require-module.decorator';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, TenantScopeGuard, RolesGuard, ModuleAccessGuard)
  @Roles('ADMIN', 'MANAGER')
  @RequireModule('reports')
  getReports(@Req() req: Request & { user: { clientId: string } }) {
    return this.reportsService.getUsageReport(req.user.clientId);
  }
}
