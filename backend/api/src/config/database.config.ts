import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'lfv',
  password: process.env.DATABASE_PASSWORD ?? 'lfv',
  database: process.env.DATABASE_NAME ?? 'light_for_volunteer',
  synchronize: process.env.DATABASE_SYNC === 'true',
  migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === 'true',
}));
