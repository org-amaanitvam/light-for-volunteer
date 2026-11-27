import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

/**
 * Migration adding student_friendly and commitment fields to opportunities table,
 * along with corresponding indexes for optimized query filtering and sorting.
 * Owned by Aryan.
 */
export class AddStudentFriendlyAndCommitmentToOpportunities1761500000000
  implements MigrationInterface
{
  name = 'AddStudentFriendlyAndCommitmentToOpportunities1761500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('opportunities');
    if (!hasTable) {
      return;
    }

    const table = await queryRunner.getTable('opportunities');
    if (table && !table.findColumnByName('student_friendly')) {
      await queryRunner.addColumn(
        'opportunities',
        new TableColumn({
          name: 'student_friendly',
          type: 'boolean',
          default: false,
          isNullable: false,
        }),
      );
    }

    if (table && !table.findColumnByName('commitment')) {
      await queryRunner.addColumn(
        'opportunities',
        new TableColumn({
          name: 'commitment',
          type: 'varchar',
          length: '128',
          isNullable: true,
        }),
      );
    }

    const updatedTable = await queryRunner.getTable('opportunities');
    if (
      updatedTable &&
      !updatedTable.indices.some((idx) => idx.name === 'IDX_opportunities_student_friendly')
    ) {
      await queryRunner.createIndex(
        'opportunities',
        new TableIndex({
          name: 'IDX_opportunities_student_friendly',
          columnNames: ['student_friendly'],
        }),
      );
    }

    if (
      updatedTable &&
      !updatedTable.indices.some((idx) => idx.name === 'IDX_opportunities_commitment')
    ) {
      await queryRunner.createIndex(
        'opportunities',
        new TableIndex({
          name: 'IDX_opportunities_commitment',
          columnNames: ['commitment'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('opportunities');
    if (!hasTable) {
      return;
    }

    const table = await queryRunner.getTable('opportunities');
    if (table) {
      if (table.indices.some((idx) => idx.name === 'IDX_opportunities_commitment')) {
        await queryRunner.dropIndex('opportunities', 'IDX_opportunities_commitment');
      }
      if (
        table.indices.some((idx) => idx.name === 'IDX_opportunities_student_friendly')
      ) {
        await queryRunner.dropIndex('opportunities', 'IDX_opportunities_student_friendly');
      }
      if (table.findColumnByName('commitment')) {
        await queryRunner.dropColumn('opportunities', 'commitment');
      }
      if (table.findColumnByName('student_friendly')) {
        await queryRunner.dropColumn('opportunities', 'student_friendly');
      }
    }
  }
}
