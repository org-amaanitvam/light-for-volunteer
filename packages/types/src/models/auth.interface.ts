import type { Role } from '../enums/role.enum';

/** Pair returned by every authentication endpoint that issues tokens. */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** The authenticated user as returned by `GET /api/auth/me`. */
export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string | null;
  city: string | null;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse extends TokenPair {
  user: AuthUserResponse;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ExchangeCodeRequest {
  code: string;
  role?: Role;
}
