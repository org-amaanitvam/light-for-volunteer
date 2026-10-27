/**
 * Runs before any test module is imported, so these values are in place
 * BEFORE `load-env` reads the repo `.env` (dotenv never overrides existing
 * variables).
 *
 * - sync schema for tests (no migration step in the test loop)
 * - 2s refresh-grace window so rotation/reuse tests stay fast
 * - high rate limits so smoke tests never trip the throttler
 * - Google OAuth disabled so /auth/google deterministically answers 503
 *   (CI injects fake credentials; tests must not depend on them)
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_SYNC = 'true';
process.env.DATABASE_MIGRATIONS_RUN = 'false';
process.env.REFRESH_GRACE_SECONDS = '2';
process.env.THROTTLE_AUTH_LIMIT = '1000';
process.env.THROTTLE_AUTH_TTL = '60';
process.env.THROTTLE_GLOBAL_LIMIT = '10000';
process.env.JWT_ACCESS_SECRET ||= 'test-access-secret-0123456789abcdef';
process.env.JWT_REFRESH_SECRET ||= 'test-refresh-secret-0123456789abcdef';
process.env.WEB_ORIGIN ||= 'http://localhost:3000';
process.env.GOOGLE_CLIENT_ID = '';
process.env.GOOGLE_CLIENT_SECRET = '';
process.env.ADMIN_EMAIL ||= '';
process.env.ADMIN_PASSWORD ||= '';

process.env.STORAGE_PROVIDER ||= 'r2';
process.env.R2_ACCOUNT_ID ||= 'test-account-id';
process.env.R2_REGION ||= 'auto';
process.env.R2_BUCKET_NAME ||= 'test-storage-bucket';
process.env.R2_ENDPOINT ||= 'https://test-account-id.r2.cloudflarestorage.com';
process.env.R2_ACCESS_KEY_ID ||= 'testing-access-key-id';
process.env.R2_SECRET_ACCESS_KEY ||= 'testing-secret-access-key';
