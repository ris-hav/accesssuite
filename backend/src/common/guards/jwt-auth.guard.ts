import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// AuthGuard('jwt') looks up the Passport strategy registered under the name
// 'jwt' — that's JwtStrategy, since PassportStrategy(Strategy) defaults to
// that name for the passport-jwt Strategy class.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
