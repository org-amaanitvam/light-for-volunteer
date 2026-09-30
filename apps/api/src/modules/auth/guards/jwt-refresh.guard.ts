import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Validates the refresh token (taken from the request body, not the
 * Authorization header) via the `jwt-refresh` strategy. Applied per-route:
 *
 * ```ts
 * @Public() @UseGuards(JwtRefreshGuard) @Post('refresh')
 * ```
 * The `@Public()` decorator keeps the global `JwtAuthGuard` out of the way.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  override handleRequest<TUser = unknown>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException('Invalid or expired refresh token');
    }
    return user;
  }
}
