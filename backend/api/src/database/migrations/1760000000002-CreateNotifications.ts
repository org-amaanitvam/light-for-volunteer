import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Creates the `notifications` table for in-app notifications.
 *
 * Owner: Suraj. Pure additive — does NOT alter any existing table.
 */
export class CreateNotifications1760000000002 implements MigrationInterface {
  name = 'CreateNotifications1760000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum type first.
    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM (
        'message',
        'application_update',
        'review_received',
        'badge_awarded',
        'deadline_reminder',
        'opportunity_status',
        'system'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'notifications',
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
          },
          {
            name: 'type',
            type: 'notification_type_enum',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'body',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'is_read',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'reference_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reference_type',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
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
        indices: [
          {
            name: 'IDX_notification_user_read',
            columnNames: ['user_id', 'is_read'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
    await queryRunner.query('DROP TYPE IF EXISTS "notification_type_enum"');
  }
}
