import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

// Team management for the caller's own client -- not gated by @RequireModule,
// since managing your own team is basic account administration, not a
// premium feature a subscription plan grants or withholds.
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantScopeGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'MANAGER')
  list(@Req() req: Request & { user: { clientId: string } }) {
    return this.usersService.listForClient(req.user.clientId);
  }

  @Post()
  @Roles('ADMIN')
  create(
    @Req() req: Request & { user: { clientId: string } },
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.createForClient(req.user.clientId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Req() req: Request & { user: { clientId: string; userId: string } },
    @Param('id') targetUserId: string,
  ) {
    return this.usersService.deleteFromClient(
      req.user.clientId,
      targetUserId,
      req.user.userId,
    );
  }
}
