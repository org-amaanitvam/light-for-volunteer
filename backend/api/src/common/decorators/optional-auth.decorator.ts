import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { IS_PUBLIC_KEY } from './public.decorator';
import { OptionalJwtAuthGuard } from '../../modules/auth/guards/optional-jwt-auth.guard';

/**
 * Marks a route as publicly accessible **and** optionally authenticated.
 *
 * When a caller provides a valid `Authorization: Bearer <token>` header the
 * JWT is validated and `@CurrentUser()` returns the decoded payload.
 * When no token (or an invalid token) is provided the request is still
 * allowed through and `@CurrentUser()` returns `undefined`.
 *
 * This is intentionally different from `@Public()`, which skips JWT
 * processing entirely and always yields `@CurrentUser() = undefined`.
 * Use `@OptionalAuth()` on routes where the response content or access rules
 * depend on whether the caller is authenticated (e.g. a listing endpoint that
 * shows draft opportunities only to the owning organisation).
 *
 * Internally this sets the IS_PUBLIC_KEY so the global `JwtAuthGuard` does
 * not reject unauthenticated requests, and adds `OptionalJwtAuthGuard` as a
 * route-level guard that populates `request.user` when a valid token is present.
 */
export const OptionalAuth = () =>
  applyDecorators(
    SetMetadata(IS_PUBLIC_KEY, true),
    UseGuards(OptionalJwtAuthGuard),
  );
