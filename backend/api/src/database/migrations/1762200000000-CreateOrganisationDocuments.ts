import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOrganisationDocuments1762200000000 implements MigrationInterface {
  name = 'CreateOrganisationDocuments1762200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "organisation_document_type_enum" AS ENUM (
        'registration_certificate',
        'pan_certificate',
        'certificate_12a',
        'certificate_80g',
        'darpan_id',
        'cin_certificate',
        'gst_certificate',
        'authorisation_letter',
        'affiliation_proof'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "organisation_document_status_enum" AS ENUM (
        'pending',
        'approved',
        'rejected',
        'needs_info'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'organisation_documents',
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
          {
            name: 'uploaded_by_membership_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'document_type',
            type: 'organisation_document_type_enum',
            isNullable: false,
          },
          { name: 'file_key', type: 'varchar', length: '1024', isNullable: false },
          { name: 'storage_provider', type: 'varchar', length: '32', isNullable: false, default: "'r2'" },
          { name: 'original_file_name', type: 'varchar', length: '255', isNullable: false },
          { name: 'mime_type', type: 'varchar', length: '100', isNullable: false },
          { name: 'file_size', type: 'integer', isNullable: false },
          {
            name: 'status',
            type: 'organisation_document_status_enum',
            isNullable: false,
            default: "'pending'",
          },
          { name: 'is_required', type: 'boolean', isNullable: false, default: true },
          { name: 'rejection_reason', type: 'text', isNullable: true },
          { name: 'uploaded_by', type: 'uuid', isNullable: true },
          { name: 'reviewed_by', type: 'uuid', isNullable: true },
          { name: 'reviewed_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['organisation_id'],
            referencedTableName: 'organisations',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['uploaded_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['uploaded_by_membership_id'],
            referencedTableName: 'organisation_members',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['reviewed_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
        uniques: [
          {
            name: 'UQ_organisation_documents_organisation_type',
            columnNames: ['organisation_id', 'document_type'],
          },
          {
            name: 'UQ_organisation_documents_file_key',
            columnNames: ['file_key'],
          },
        ],
        indices: [
          {
            name: 'IDX_organisation_documents_organisation_status',
            columnNames: ['organisation_id', 'status'],
          },
          {
            name: 'IDX_organisation_documents_type_status',
            columnNames: ['document_type', 'status'],
          },
          {
            name: 'IDX_organisation_documents_uploaded_membership',
            columnNames: ['uploaded_by_membership_id'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('organisation_documents');
    await queryRunner.query('DROP TYPE "organisation_document_status_enum"');
    await queryRunner.query('DROP TYPE "organisation_document_type_enum"');
  }
}
