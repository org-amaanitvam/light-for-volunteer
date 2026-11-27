import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOrganisationMembers1761400000000 implements MigrationInterface {
  name = 'CreateOrganisationMembers1761400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "organisation_member_role_enum"
      AS ENUM ('owner', 'recruiter', 'viewer')
    `);
    await queryRunner.query(`
      CREATE TYPE "organisation_member_status_enum"
      AS ENUM ('pending', 'approved', 'rejected', 'removed')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'organisation_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'organisation_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          {
            name: 'role',
            type: 'organisation_member_role_enum',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'organisation_member_status_enum',
            isNullable: false,
            default: "'pending'",
          },
          { name: 'job_title', type: 'varchar', length: '255', isNullable: true },
          { name: 'decided_by', type: 'uuid', isNullable: true },
          { name: 'decided_at', type: 'timestamptz', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['organisation_id'],
            referencedTableName: 'organisations',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['decided_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
        uniques: [
          {
            name: 'UQ_organisation_members_organisation_user',
            columnNames: ['organisation_id', 'user_id'],
          },
        ],
        indices: [
          {
            name: 'IDX_organisation_members_organisation_status',
            columnNames: ['organisation_id', 'status'],
          },
          {
            name: 'IDX_organisation_members_user_status',
            columnNames: ['user_id', 'status'],
          },
        ],
      }),
    );

    await queryRunner.query(`
      INSERT INTO "organisation_members"
        ("organisation_id", "user_id", "role", "status", "decided_by", "decided_at")
      SELECT "id", "user_id", 'owner', 'approved', "user_id", now()
      FROM "organisations"
    `);

    const organisations = await queryRunner.getTable('organisations');
    if (!organisations) throw new Error('organisations table does not exist');

    const ownerForeignKey = organisations.foreignKeys.find((foreignKey) =>
      foreignKey.columnNames.includes('user_id'),
    );
    if (ownerForeignKey) {
      await queryRunner.dropForeignKey(organisations, ownerForeignKey);
    }

    const ownerUnique = organisations.uniques.find((unique) =>
      unique.columnNames.includes('user_id'),
    );
    if (ownerUnique) {
      await queryRunner.dropUniqueConstraint(organisations, ownerUnique);
    }

    await queryRunner.dropColumn('organisations', 'user_id');
    await this.replaceOrganisationRatingFunction(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "organisations"
      ADD COLUMN "user_id" uuid NULL
    `);
    await queryRunner.query(`
      UPDATE "organisations" AS organisation
      SET "user_id" = members."user_id"
      FROM "organisation_members" AS members
      WHERE members."organisation_id" = organisation."id"
        AND members."role" = 'owner'
        AND members."status" = 'approved'
    `);
    await queryRunner.query(`
      ALTER TABLE "organisations"
      ALTER COLUMN "user_id" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "organisations"
      ADD CONSTRAINT "UQ_organisations_user_id" UNIQUE ("user_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "organisations"
      ADD CONSTRAINT "FK_organisations_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.dropTable('organisation_members');
    await queryRunner.query('DROP TYPE "organisation_member_status_enum"');
    await queryRunner.query('DROP TYPE "organisation_member_role_enum"');
    await this.restoreOrganisationRatingFunction(queryRunner);
  }

  private async replaceOrganisationRatingFunction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_organisation_rating_for_user(target_user_id uuid)
      RETURNS void LANGUAGE plpgsql AS $$
      BEGIN
        UPDATE "organisations" AS organisation
        SET "rating_avg" = COALESCE((
          SELECT AVG(review."rating")::double precision
          FROM "reviews" AS review
          WHERE review."given_to" = target_user_id
        ), 0)
        WHERE EXISTS (
          SELECT 1
          FROM "organisation_members" AS member
          WHERE member."organisation_id" = organisation."id"
            AND member."user_id" = target_user_id
            AND member."role" = 'owner'
            AND member."status" = 'approved'
        );
      END;
      $$
    `);
  }

  private async restoreOrganisationRatingFunction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_organisation_rating_for_user(target_user_id uuid)
      RETURNS void LANGUAGE plpgsql AS $$
      BEGIN
        UPDATE "organisations" AS organisation
        SET "rating_avg" = COALESCE((
          SELECT AVG(review."rating")::double precision
          FROM "reviews" AS review
          WHERE review."given_to" = target_user_id
        ), 0)
        WHERE organisation."user_id" = target_user_id;
      END;
      $$
    `);
  }
}
