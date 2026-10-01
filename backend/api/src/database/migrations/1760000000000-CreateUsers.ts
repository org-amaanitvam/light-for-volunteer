import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Initial `users` table — owned by the Auth module for now, handed over to
 * Vishal (`src/database/` schema owner) once merged.
 *
 * Field set matches the agreed platform schema:
 * id, email, passwordHash (nullable for Google OAuth), name, role,
 * phone, city, refreshTokenHash (Postgres fallback store), googleId,
 * createdAt, updatedAt.
 */
export class CreateUsers1760000000000 implements MigrationInterface {
  name = 'CreateUsers1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
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
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          {
            name: 'role',
            type: 'enum',
            enum: ['volunteer', 'organisation', 'mentor', 'admin'],
            enumName: 'users_role_enum',
            isNullable: false,
            default: "'volunteer'",
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '32',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '128',
            isNullable: true,
          },
          {
            name: 'refresh_token_hash',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'google_id',
            type: 'varchar',
            length: '64',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
    await queryRunner.query('DROP TYPE IF EXISTS "users_role_enum"');
  }
}
