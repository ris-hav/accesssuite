import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { SignupDto } from './dto/signup.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // Deliberately unguarded: this is how a brand-new tenant joins the platform
  // in the first place, so there's no existing token to require yet.
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.clientsService.signup(dto);
  }
}
