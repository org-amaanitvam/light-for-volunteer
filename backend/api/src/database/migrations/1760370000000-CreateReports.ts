
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReports1760370000000 implements MigrationInterface {
  name = 'CreateReports1760370000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "reports_target_type_enum"
      AS ENUM ('review', 'message')
    `);

    await queryRunner.query(`
      CREATE TYPE "reports_status_enum"
      AS ENUM ('pending', 'resolved', 'dismissed')
    `);

    await queryRunner.query(`
      CREATE TYPE "reports_action_enum"
      AS ENUM ('remove_content', 'issue_warning', 'dismiss_report')
    `);

    await queryRunner.query(`
      CREATE TABLE "reports" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "reporter_id" uuid NOT NULL,
        "target_type" "reports_target_type_enum" NOT NULL,
        "target_id" uuid NOT NULL,
        "reason" text NOT NULL,
        "status" "reports_status_enum" NOT NULL DEFAULT 'pending',
        "action" "reports_action_enum",
        "resolved_by" uuid,
        "resolution_note" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "resolved_at" TIMESTAMP,
        CONSTRAINT "PK_reports_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reports_reporter"
          FOREIGN KEY ("reporter_id") REFERENCES "users"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_reports_resolved_by"
          FOREIGN KEY ("resolved_by") REFERENCES "users"("id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_reports_status_created_at"
      ON "reports" ("status", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_reports_status_created_at"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "reports"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reports_action_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reports_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reports_target_type_enum"`);
  }
}
