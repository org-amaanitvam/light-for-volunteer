import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';

/**
 * PostgreSQL connection for the whole app.
 *
 * OWNERSHIP: `src/database/` is owned by Vishal (schema + migrations). The
 * Auth module only ships the initial `CreateUsers` migration so it can run
 * standalone; everything added after that is Vishal's.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...dataSourceOptions(),
        // Tests/dev may opt into schema sync; production always uses migrations.
        synchronize: config.get<boolean>('database.synchronize', false),
        migrationsRun: config.get<boolean>('database.migrationsRun', false),
      }),
    }),
  ],
})
export class DatabaseModule {}
