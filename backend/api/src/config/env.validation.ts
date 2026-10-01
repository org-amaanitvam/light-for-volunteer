import * as Joi from 'joi';

/**
 * Fail-fast validation of the whole environment. The app refuses to boot when a
 * required variable is missing or malformed, so misconfiguration is caught at
 * startup instead of at the first request.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3001),
  WEB_ORIGIN: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('http://localhost:3000'),

  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_USER: Joi.string().default('lfv'),
  DATABASE_PASSWORD: Joi.string().allow('').default('lfv'),
  DATABASE_NAME: Joi.string().default('light_for_volunteer'),
  DATABASE_SYNC: Joi.boolean().truthy('true').falsy('false').default(false),
  DATABASE_MIGRATIONS_RUN: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  // Empty string disables Redis and switches auth to the Postgres fallback store.
  REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).allow('').optional(),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('7d'),
  JWT_REFRESH_TTL_SECONDS: Joi.number().integer().positive().default(604800),
  REFRESH_GRACE_SECONDS: Joi.number().integer().min(0).default(60),

  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  GOOGLE_CALLBACK_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .allow('')
    .optional(),

  THROTTLE_AUTH_TTL: Joi.number().integer().positive().default(60),
  THROTTLE_AUTH_LIMIT: Joi.number().integer().positive().default(10),

  ADMIN_EMAIL: Joi.string().email().allow('').optional(),
  ADMIN_PASSWORD: Joi.string().allow('').optional(),
  ADMIN_NAME: Joi.string().allow('').default('Platform Admin'),
}).unknown(true);
