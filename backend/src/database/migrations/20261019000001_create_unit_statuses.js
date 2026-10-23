/**
 * Referensi status unit (diisi seeder, read-only via API).
 * Status disimpan sebagai tabel, bukan ENUM, supaya label, warna, dan urutan
 * bisa diubah tanpa mengubah kode atau struktur tabel.
 */
export function up(knex) {
  return knex.schema.createTable('unit_statuses', (table) => {
    table.increments('id');
    table.string('code', 20).notNullable().unique();
    table.string('name', 50).notNullable();
    table.tinyint('sequence').unsigned().notNullable().unique(); // urutan alur: 1, 2, 3, 4
    table.boolean('counts_toward_capacity').notNullable(); // false untuk KELUAR
    table.string('color', 20).notNullable(); // warna badge di UI, mis. #2563EB
  });
}

export function down(knex) {
  return knex.schema.dropTable('unit_statuses');
}
