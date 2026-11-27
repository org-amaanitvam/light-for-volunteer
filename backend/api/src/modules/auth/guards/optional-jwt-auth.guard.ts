import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Optional JWT guard for routes that are publicly accessible but should also
 * recognise authenticated users when they send a valid Bearer token.
 *
 * Unlike `JwtAuthGuard` (which rejects missing / invalid tokens), this guard:
 *  - Calls the JWT Passport strategy so `request.user` is populated when a
 *    valid `Authorization: Bearer <token>` header is present.
 *  - Always returns `true` — a missing or invalid token is silently ignored
 *    and leaves `request.user` as `undefined`.
 *
 * Use with `@UseGuards(OptionalJwtAuthGuard)` (or via `@OptionalAuth()`) on
 * routes where visibility rules differ between anonymous and authenticated
 * callers (e.g. a DRAFT opportunity is hidden from the public but visible to
 * the owning organisation).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Attempt JWT validation; the result is intentionally swallowed below.
    return super.canActivate(context);
  }

  // Never reject the request — a missing or invalid token is fine.
  override handleRequest<TUser = unknown>(
    _err: Error | null,
    user: TUser,
  ): TUser {
    // `user` is `false` when no token is provided; return `undefined` so that
    // `@CurrentUser()` returns `undefined` rather than `false`.
    return (user || undefined) as TUser;
  }
}
