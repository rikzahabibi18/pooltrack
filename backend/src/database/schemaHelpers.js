/**
 * Helper kecil untuk migration agar definisi kolom yang berulang tetap konsisten.
 * (Sengaja tidak diletakkan di folder migrations, karena Knex akan menganggapnya migration.)
 */

/** created_at & updated_at; updated_at otomatis berubah setiap baris di-UPDATE. */
export function addTimestamps(table, knex) {
  table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
}

/**
 * Kolom foreign key INT UNSIGNED (sama dengan tipe `increments()` di tabel induk).
 * Default ON DELETE RESTRICT: data induk tidak bisa dihapus selama masih dipakai.
 */
export function addForeignKey(table, column, parentTable, { nullable = false, onDelete = 'RESTRICT' } = {}) {
  const definition = table.integer(column).unsigned();
  if (nullable) definition.nullable();
  else definition.notNullable();

  table.foreign(column).references('id').inTable(parentTable).onDelete(onDelete).onUpdate('CASCADE');
}
