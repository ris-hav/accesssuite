import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { requireEnv } from '../common/env';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  clientId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireEnv('JWT_SECRET'),
    });
  }

  // Whatever this returns becomes `req.user` on every guarded route.
  // Runs only after the token's signature and expiry have already been verified.
  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      isSuperAdmin: payload.isSuperAdmin,
      clientId: payload.clientId,
    };
  }
}
