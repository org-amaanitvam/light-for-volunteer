import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewsAndBadges1761100000000 implements MigrationInterface {
  name = 'CreateReviewsAndBadges1761100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "badges" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" varchar NOT NULL UNIQUE,
        "title" varchar NOT NULL,
        "criteria" text NOT NULL,
        "icon_url" varchar NOT NULL DEFAULT ''
      )
    `);
    await queryRunner.query(`
      INSERT INTO "badges" ("code", "title", "criteria", "icon_url") VALUES
        ('FIRST_STEP', 'First Step', 'Submit your first volunteer application.', ''),
        ('FIVE_COMPLETIONS', 'Community Champion', 'Complete five volunteer opportunities.', '')
      ON CONFLICT ("code") DO NOTHING
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "application_id" uuid NOT NULL REFERENCES "applications"("id") ON DELETE CASCADE,
        "rating" integer NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
        "comment" text,
        "given_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "given_to" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_reviews_application_reviewer_recipient" UNIQUE ("application_id", "given_by", "given_to")
      )
    `);
    await queryRunner.query(`ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "created_at" timestamptz NOT NULL DEFAULT now()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "reviews"');
    await queryRunner.query('DROP TABLE IF EXISTS "badges"');
  }
}
