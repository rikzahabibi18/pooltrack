import { addForeignKey } from '../schemaHelpers.js';

/**
 * Jejak audit perubahan status unit (MASUK → DIINSPEKSI → ...).
 * - from_status_id NULL untuk catatan pertama (unit baru masuk).
 * - ON DELETE CASCADE ke units: riwayat ikut terhapus jika unit (status MASUK) dihapus.
 */
export function up(knex) {
  return knex.schema.createTable('unit_status_histories', (table) => {
    table.increments('id');
    addForeignKey(table, 'unit_id', 'units', { onDelete: 'CASCADE' });
    addForeignKey(table, 'from_status_id', 'unit_statuses', { nullable: true });
    addForeignKey(table, 'to_status_id', 'unit_statuses');
    table.string('note', 255).nullable();
    table.timestamp('changed_at').notNullable().defaultTo(knex.fn.now());

    table.index(['unit_id', 'changed_at']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('unit_status_histories');
}
