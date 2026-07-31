import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  clientId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // Note: `configService` here is used by name directly in the super() call
  // below, not via `this.configService` — you can't touch `this` before
  // super() runs in a derived class, but the plain constructor parameter is
  // just a local variable at that point, so referencing it directly is fine.
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Whatever this returns becomes `req.user` on every guarded route.
  // Runs only after the token's signature and expiry have already been verified.
  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      isSuperAdmin: payload.isSuperAdmin,
      clientId: payload.clientId,
    };
  }
}
