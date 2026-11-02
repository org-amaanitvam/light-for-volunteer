import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/** Adds the application and volunteer profile tables used by the live APIs. */
export class CreateApplicationsAndVolunteerProfiles1761000000000
  implements MigrationInterface
{
  name = 'CreateApplicationsAndVolunteerProfiles1761000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "applications_status_enum" AS ENUM
          ('applied', 'shortlisted', 'selected', 'completed', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    if (!(await queryRunner.hasTable('volunteer_profiles'))) {
      await queryRunner.createTable(
        new Table({
          name: 'volunteer_profiles',
          columns: [
            { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
            { name: 'user_id', type: 'uuid', isUnique: true },
            { name: 'headline', type: 'text', isNullable: true },
            { name: 'about', type: 'text', isNullable: true },
            { name: 'skills', type: 'text', isNullable: true },
            { name: 'resume_url', type: 'varchar', length: '255', isNullable: true },
            { name: 'portfolio_links', type: 'text', isNullable: true },
            { name: 'points', type: 'int', default: '0' },
            { name: 'badges', type: 'text', isNullable: true },
            { name: 'rating_avg', type: 'double precision', default: '0' },
          ],
          foreignKeys: [
            {
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
          ],
        }),
        true,
      );
    }

    if (!(await queryRunner.hasTable('applications'))) {
      await queryRunner.createTable(
        new Table({
          name: 'applications',
          columns: [
            { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
            { name: 'opportunity_id', type: 'uuid' },
            { name: 'volunteer_id', type: 'uuid' },
            { name: 'pitch_text', type: 'text' },
            { name: 'status', type: 'applications_status_enum', default: "'applied'" },
            { name: 'applied_at', type: 'timestamptz', default: 'now()' },
          ],
          foreignKeys: [
            {
              columnNames: ['opportunity_id'],
              referencedTableName: 'opportunities',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
            {
              columnNames: ['volunteer_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('applications')) {
      await queryRunner.dropTable('applications', true);
    }
    if (await queryRunner.hasTable('volunteer_profiles')) {
      await queryRunner.dropTable('volunteer_profiles', true);
    }
    await queryRunner.query('DROP TYPE IF EXISTS "applications_status_enum"');
  }
}
