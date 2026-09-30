import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as reachable without an access token. The global
 * `JwtAuthGuard` skips authentication for these routes; route-level guards
 * (e.g. `JwtRefreshGuard`, `GoogleAuthGuard`) still apply.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
