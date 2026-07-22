import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { requireEnv } from '../common/env';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: requireEnv('JWT_SECRET'),
      // `expiresIn` wants a branded string type from the `ms` package (e.g. '1d', '2h'),
      // but env vars are always plain `string` — narrow cast is safe, value is our own config.
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as `${number}d` },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
