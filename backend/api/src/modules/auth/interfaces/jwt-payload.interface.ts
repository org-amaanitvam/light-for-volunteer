import type { Role } from '@lfv/types';

/** Claims carried by the 15-minute access token. */
export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: Role;
  typ: 'access';
}

/** Claims carried by the 7-day refresh token (rotation id via `jti`). */
export interface JwtRefreshPayload {
  sub: string;
  email: string;
  role: Role;
  typ: 'refresh';
  jti: string;
}
