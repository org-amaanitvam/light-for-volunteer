import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Standalone DataSource for the TypeORM CLI
 * (`typeorm-ts-node-commonjs migration:* -d src/database/data-source.ts`)
 * and for scripts that need a raw connection (seeds).
 *
 * Both `.env` locations are loaded here so the CLI works regardless of cwd.
 */
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const normalizedDir = __dirname.split(path.sep).join('/');
const databaseUrl = process.env.DATABASE_URL?.trim();

export const dataSourceOptions = (): DataSourceOptions => ({
  type: 'postgres',
  // A hosted connection URL (for example Neon) takes precedence over the
  // individual connection fields used by the local Docker database.
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: process.env.DATABASE_HOST ?? 'localhost',
        port: Number(process.env.DATABASE_PORT ?? 5432),
        username: process.env.DATABASE_USER ?? 'lfv',
        password: process.env.DATABASE_PASSWORD ?? 'lfv',
        database: process.env.DATABASE_NAME ?? 'light_for_volunteer',
      }),
  // Glob picks up every entity in the app (src in dev, dist in prod) so
  // teammates only drop in a file to register their model — Vishal's schema.
  entities: [`${normalizedDir}/../**/*.entity.{js,ts}`],
  migrations: [`${normalizedDir}/migrations/*.{js,ts}`],
  synchronize: false,
  migrationsRun: false,
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

const dataSource = new DataSource(dataSourceOptions());

export default dataSource;
