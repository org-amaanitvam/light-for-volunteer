import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminAuditLogs1762060000000
  implements MigrationInterface
{
  name = 'CreateAdminAuditLogs1762060000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "admin_audit_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "admin_id" uuid,
        "action" varchar(100) NOT NULL,
        "target_type" varchar(50) NOT NULL,
        "target_id" uuid NOT NULL,
        "details" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

        CONSTRAINT "PK_admin_audit_logs_id"
          PRIMARY KEY ("id"),

        CONSTRAINT "FK_admin_audit_logs_admin"
          FOREIGN KEY ("admin_id")
          REFERENCES "users"("id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_admin_audit_logs_created_at"
      ON "admin_audit_logs" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_admin_audit_logs_admin_id"
      ON "admin_audit_logs" ("admin_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_admin_audit_logs_target"
      ON "admin_audit_logs" ("target_type", "target_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_admin_audit_logs_target"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_admin_audit_logs_admin_id"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_admin_audit_logs_created_at"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "admin_audit_logs"
    `);
  }
}
