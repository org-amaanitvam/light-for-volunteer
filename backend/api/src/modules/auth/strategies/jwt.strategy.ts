import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtAccessPayload } from '../interfaces/jwt-payload.interface';

/**
 * Validates the short-lived access token from the `Authorization: Bearer`
 * header. The returned payload becomes `request.user` for `@CurrentUser()`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('auth.access.secret')!,
    });
  }

  validate(payload: JwtAccessPayload): JwtAccessPayload {
    // A refresh token replayed as an access token must never authenticate.
    if (payload?.typ !== 'access' || !payload.sub) {
      throw new UnauthorizedException('Invalid access token');
    }
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      typ: 'access',
    };
  }
}
