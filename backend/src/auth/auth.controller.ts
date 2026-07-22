import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Gives the frontend a way to fetch "who am I, and what can I see" from a
  // token alone — the dashboard renders its module tiles from this response.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(
    @Req()
    req: Request & {
      user: { userId: string; email: string; role: string; isSuperAdmin: boolean; clientId: string | null };
    },
  ) {
    return this.authService.getMe(req.user);
  }
}
