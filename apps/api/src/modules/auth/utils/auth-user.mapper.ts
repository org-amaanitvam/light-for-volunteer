import type { AuthUserResponse } from '@lfv/types';
import type { User } from '../../users/entities/user.entity';

/** Strips every secret column before a user object leaves the API. */
export const toAuthUserResponse = (user: User): AuthUserResponse => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  phone: user.phone,
  city: user.city,
  googleId: user.googleId,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});
