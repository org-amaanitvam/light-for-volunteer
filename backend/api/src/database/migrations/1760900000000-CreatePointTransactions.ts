import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePointTransactions1760900000000
  implements MigrationInterface
{
  name = 'CreatePointTransactions1760900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "point_transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "event_type" varchar(100) NOT NULL,
        "event_key" varchar(255) NOT NULL,
        "points" integer NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_point_transactions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_point_transactions_event_key" UNIQUE ("event_key"),
        CONSTRAINT "FK_point_transactions_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_point_transactions_user_created"
      ON "point_transactions" ("user_id", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_point_transactions_user_created"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "point_transactions"`,
    );
  }
}
