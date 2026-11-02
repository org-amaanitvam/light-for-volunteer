import { MigrationInterface, QueryRunner } from 'typeorm';

/** Keeps each organisation rating in sync with reviews addressed to its owner. */
export class AggregateOrganisationRatings1761200000000 implements MigrationInterface {
  name = 'AggregateOrganisationRatings1761200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      $$;
    `);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_organisation_rating_after_review_change()
      RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF TG_OP = 'DELETE' THEN
          PERFORM refresh_organisation_rating_for_user(OLD."given_to");
          RETURN OLD;
        END IF;

        PERFORM refresh_organisation_rating_for_user(NEW."given_to");
        IF TG_OP = 'UPDATE' AND OLD."given_to" IS DISTINCT FROM NEW."given_to" THEN
          PERFORM refresh_organisation_rating_for_user(OLD."given_to");
        END IF;
        RETURN NEW;
      END;
      $$;
    `);
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS "TR_reviews_refresh_organisation_rating" ON "reviews";
      CREATE TRIGGER "TR_reviews_refresh_organisation_rating"
      AFTER INSERT OR UPDATE OR DELETE ON "reviews"
      FOR EACH ROW EXECUTE FUNCTION refresh_organisation_rating_after_review_change();
    `);
    await queryRunner.query(`
      UPDATE "organisations" AS organisation
      SET "rating_avg" = COALESCE((
        SELECT AVG(review."rating")::double precision
        FROM "reviews" AS review
        WHERE review."given_to" = organisation."user_id"
      ), 0);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TRIGGER IF EXISTS "TR_reviews_refresh_organisation_rating" ON "reviews"');
    await queryRunner.query('DROP FUNCTION IF EXISTS refresh_organisation_rating_after_review_change()');
    await queryRunner.query('DROP FUNCTION IF EXISTS refresh_organisation_rating_for_user(uuid)');
  }
}
