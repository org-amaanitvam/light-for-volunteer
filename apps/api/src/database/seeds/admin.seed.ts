import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as argon2 from 'argon2';
import dataSource from '../data-source';
import { User } from '../../modules/users/entities/user.entity';
import { DEFAULT_ROLE, ROLES } from '@lfv/types';

/**
 * Idempotent admin bootstrap.
 *
 * `ADMIN_EMAIL` + `ADMIN_PASSWORD` are set → create the account (or promote an
 * existing one to `admin`). Blank env → no-op, so CI and dev machines without
 * secrets never fail.
 *
 * Usage: `npm run seed:admin -w apps/api`
 */
async function main(): Promise<void> {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Platform Admin';

  if (!email || !password) {
    console.log('[seed:admin] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping.');
    return;
  }
  if (password.length < 8) {
    throw new Error('[seed:admin] ADMIN_PASSWORD must be at least 8 characters');
  }

  const db = await dataSource.initialize();
  try {
    const users = db.getRepository(User);

    const existingAdmin = await users.findOne({ where: { role: 'admin' } });
    if (existingAdmin) {
      console.log(`[seed:admin] Admin already present (${existingAdmin.email}) — nothing to do.`);
      return;
    }

    const existing = await users.findOne({ where: { email } });
    if (existing) {
      existing.role = 'admin';
      existing.passwordHash = await argon2.hash(password);
      await users.save(existing);
      console.log(`[seed:admin] Promoted existing user ${email} to admin.`);
      return;
    }

    const admin = users.create({
      email,
      name,
      passwordHash: await argon2.hash(password),
      role: 'admin',
      phone: null,
      city: null,
      googleId: null,
    });
    await users.save(admin);
    console.log(
      `[seed:admin] Created admin ${email} (roles available: ${ROLES.join(', ')}; default ${DEFAULT_ROLE}).`,
    );
  } finally {
    await db.destroy();
  }
}

main().catch((error: unknown) => {
  console.error('[seed:admin] failed:', error);
  process.exitCode = 1;
});
