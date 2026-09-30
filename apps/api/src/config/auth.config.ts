import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? '';
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? '';

  return {
    access: {
      secret: process.env.JWT_ACCESS_SECRET as string,
      ttl: process.env.JWT_ACCESS_TTL ?? '15m',
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET as string,
      ttl: process.env.JWT_REFRESH_TTL ?? '7d',
      ttlSeconds: Number(process.env.JWT_REFRESH_TTL_SECONDS ?? 604800),
      graceSeconds: Number(process.env.REFRESH_GRACE_SECONDS ?? 60),
    },
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:3001/api/auth/google/callback',
      // The strategy/guard short-circuits with 503 until credentials exist.
      enabled: Boolean(googleClientId && googleClientSecret),
    },
    throttle: {
      ttlSeconds: Number(process.env.THROTTLE_AUTH_TTL ?? 60),
      limit: Number(process.env.THROTTLE_AUTH_LIMIT ?? 10),
    },
    exchangeCodeTtlSeconds: 60,
  };
});
