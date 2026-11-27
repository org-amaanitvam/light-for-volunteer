import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompleteRemainingFeatures1761300000000 implements MigrationInterface {
  name = 'CompleteRemainingFeatures1761300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "completed_at" timestamptz NULL');
    await queryRunner.query('ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "completed_hours" int NOT NULL DEFAULT 0');
    await queryRunner.query(`
      UPDATE "applications" SET "completed_at" = "applied_at"
      WHERE "status" = 'completed' AND "completed_at" IS NULL
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "admin_id" uuid NULL REFERENCES "users"("id") ON DELETE SET NULL,
        "action" varchar(80) NOT NULL,
        "entity_type" varchar(50) NOT NULL,
        "entity_id" uuid NULL,
        "details" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_audit_logs_created_at" ON "audit_logs" ("created_at" DESC)');
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_organisation_rating_for_user(target_user_id uuid)
      RETURNS void LANGUAGE plpgsql AS $$
      BEGIN
        UPDATE "organisations" AS organisation
        SET "rating_avg" = COALESCE((
          SELECT AVG(review."rating")::double precision FROM "reviews" AS review
          WHERE review."given_to" = target_user_id
        ), 0)
        WHERE organisation."user_id" = target_user_id;

        UPDATE "volunteer_profiles" AS profile
        SET "rating_avg" = COALESCE((
          SELECT AVG(review."rating")::double precision FROM "reviews" AS review
          WHERE review."given_to" = target_user_id
        ), 0)
        WHERE profile."user_id" = target_user_id;
      END;
      $$
    `);
    await queryRunner.query(`
      UPDATE "volunteer_profiles" AS profile
      SET "rating_avg" = COALESCE((
        SELECT AVG(review."rating")::double precision FROM "reviews" AS review
        JOIN "users" AS reviewer ON reviewer."id" = review."given_to"
        WHERE reviewer."id" = profile."user_id"
      ), 0)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_organisation_rating_for_user(target_user_id uuid)
      RETURNS void LANGUAGE plpgsql AS $$
      BEGIN
        UPDATE "organisations" AS organisation
        SET "rating_avg" = COALESCE((
          SELECT AVG(review."rating")::double precision FROM "reviews" AS review
          WHERE review."given_to" = target_user_id
        ), 0)
        WHERE organisation."user_id" = target_user_id;
      END;
      $$
    `);
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_audit_logs_created_at"');
    await queryRunner.query('DROP TABLE IF EXISTS "audit_logs"');
    await queryRunner.query('ALTER TABLE "applications" DROP COLUMN IF EXISTS "completed_at"');
    await queryRunner.query('ALTER TABLE "applications" DROP COLUMN IF EXISTS "completed_hours"');
  }
}
