import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Loads `.env` before anything else runs. This module is imported FIRST by
 * `app.module.ts`, `data-source.ts` and the seed scripts so that decorator-time
 * configuration (e.g. `@Throttle` limits on the auth controller) sees the values.
 *
 * Search order: `apps/api/.env` (local override) → repo root `.env`.
 * dotenv does not overwrite variables that are already set (e.g. in CI).
 */
const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
];

for (const candidate of candidates) {
  dotenv.config({ path: candidate });
}
