import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  // `null`/'' disables Redis entirely → auth falls back to the Postgres store.
  url: process.env.REDIS_URL?.trim() || null,
}));
