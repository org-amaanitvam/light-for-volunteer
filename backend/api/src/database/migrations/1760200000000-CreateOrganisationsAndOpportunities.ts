import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Creates organisations and opportunities tables, enums, and foreign keys.
 * Owned by Aryan (Opportunities module) with schema alignment for Vishal.
 */
export class CreateOrganisationsAndOpportunities1760200000000 implements MigrationInterface {
  name = 'CreateOrganisationsAndOpportunities1760200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "verification_status_enum" AS ENUM ('pending', 'verified', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "opportunity_type_enum" AS ENUM ('Internship', 'Volunteering', 'Challenge', 'Fellowship', 'Event');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "location_type_enum" AS ENUM ('On-site', 'Remote', 'Hybrid');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "opportunity_status_enum" AS ENUM ('draft', 'pending_review', 'live', 'closed', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    const hasOrganisations = await queryRunner.hasTable('organisations');
    if (!hasOrganisations) {
      await queryRunner.createTable(
        new Table({
          name: 'organisations',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'uuid',
              default: 'gen_random_uuid()',
            },
            {
              name: 'user_id',
              type: 'uuid',
              isNullable: false,
              isUnique: true,
            },
            {
              name: 'org_name',
              type: 'varchar',
              length: '255',
              isNullable: false,
            },
            {
              name: 'about',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'website',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'registration_type',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'registration_id',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'verification_doc_url',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'verification_status',
              type: 'verification_status_enum',
              default: "'pending'",
            },
            {
              name: 'rating_avg',
              type: 'float',
              default: 0.0,
            },
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

    const hasOpportunities = await queryRunner.hasTable('opportunities');
    if (!hasOpportunities) {
      await queryRunner.createTable(
        new Table({
          name: 'opportunities',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'uuid',
              default: 'gen_random_uuid()',
            },
            {
              name: 'org_id',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'title',
              type: 'varchar',
              length: '255',
              isNullable: false,
            },
            {
              name: 'description',
              type: 'text',
              isNullable: false,
            },
            {
              name: 'type',
              type: 'opportunity_type_enum',
              isNullable: false,
            },
            {
              name: 'category',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'skills_required',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'location_type',
              type: 'location_type_enum',
              isNullable: false,
            },
            {
              name: 'city',
              type: 'varchar',
              length: '128',
              isNullable: true,
            },
            {
              name: 'duration',
              type: 'varchar',
              length: '128',
              isNullable: true,
            },
            {
              name: 'points_reward',
              type: 'int',
              default: 0,
            },
            {
              name: 'openings',
              type: 'int',
              default: 1,
            },
            {
              name: 'deadline',
              type: 'date',
              isNullable: true,
            },
            {
              name: 'status',
              type: 'opportunity_status_enum',
              default: "'draft'",
            },
            {
              name: 'created_at',
              type: 'timestamptz',
              default: 'now()',
            },
            {
              name: 'updated_at',
              type: 'timestamptz',
              default: 'now()',
            },
          ],
          foreignKeys: [
            {
              columnNames: ['org_id'],
              referencedTableName: 'organisations',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
          ],
          indices: [
            { name: 'IDX_opportunities_status', columnNames: ['status'] },
            { name: 'IDX_opportunities_category', columnNames: ['category'] },
            { name: 'IDX_opportunities_type', columnNames: ['type'] },
            { name: 'IDX_opportunities_location_type', columnNames: ['location_type'] },
            { name: 'IDX_opportunities_deadline', columnNames: ['deadline'] },
            { name: 'IDX_opportunities_org_id', columnNames: ['org_id'] },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('opportunities', true);
    await queryRunner.dropTable('organisations', true);
    await queryRunner.query('DROP TYPE IF EXISTS "opportunity_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "location_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "opportunity_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "verification_status_enum"');
  }
}
