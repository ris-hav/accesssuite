import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequireModule } from '../common/decorators/require-module.decorator';

// A sample module-gated route — no real reporting logic yet. Its only job
// right now is to prove all four guards work together correctly.
@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  @Get()
  @UseGuards(JwtAuthGuard, TenantScopeGuard, RolesGuard, ModuleAccessGuard)
  @Roles('ADMIN', 'MANAGER')
  @RequireModule('reports')
  getReports(@Req() req: Request & { user: { clientId: string } }) {
    return { message: `Reports for client ${req.user.clientId}` };
  }
}
