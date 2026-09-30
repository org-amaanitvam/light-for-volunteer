/**
 * The four platform roles. Single source of truth shared by the API
 * (TypeORM enum column), the guards, and the Next.js frontend.
 */
export const ROLES = ['volunteer', 'organisation', 'mentor', 'admin'] as const;

export type Role = (typeof ROLES)[number];

export const isRole = (value: unknown): value is Role =>
  typeof value === 'string' && (ROLES as readonly string[]).includes(value);

/**
 * Roles a user may self-assign at signup or during the Google OAuth
 * exchange step. `admin` is intentionally excluded — admins are only
 * ever provisioned through the seeded admin script.
 */
export const AUTH_ROLE_ALLOWLIST = ['volunteer', 'organisation', 'mentor'] as const;

export type AuthRole = (typeof AUTH_ROLE_ALLOWLIST)[number];

export const isAuthRole = (value: unknown): value is AuthRole =>
  typeof value === 'string' && (AUTH_ROLE_ALLOWLIST as readonly string[]).includes(value);

/** Role granted when nobody explicitly picks one. */
export const DEFAULT_ROLE: AuthRole = 'volunteer';
