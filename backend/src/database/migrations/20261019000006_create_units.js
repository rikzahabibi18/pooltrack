import { addForeignKey, addTimestamps } from '../schemaHelpers.js';

/**
 * Unit kendaraan yang ditangani.
 *
 * - plate_number hanya di-INDEX, tidak UNIQUE: unit yang sudah KELUAR boleh masuk lagi
 *   dengan plat yang sama. Keunikan di antara unit aktif dicek di service.
 * - Semua relasi ON DELETE RESTRICT: master yang masih dipakai unit tidak bisa dihapus.
 */
export function up(knex) {
  return knex.schema.createTable('units', (table) => {
    table.increments('id');
    table.string('plate_number', 15).notNullable().index();
    table.string('brand', 50).notNullable();
    table.string('model', 80).notNullable();
    table.smallint('year').unsigned().notNullable();
    table.string('color', 30).nullable();
    table.string('chassis_number', 50).nullable();
    table.string('engine_number', 50).nullable();

    addForeignKey(table, 'vehicle_type_id', 'vehicle_types');
    addForeignKey(table, 'partner_id', 'partners');
    addForeignKey(table, 'pool_id', 'pools');
    addForeignKey(table, 'status_id', 'unit_statuses');

    table.date('received_at').notNullable();
    table.date('released_at').nullable(); // diisi saat status KELUAR
    table.text('notes').nullable();
    addTimestamps(table, knex);

    // Mempercepat hitung okupansi: "berapa unit aktif di pool X"
    table.index(['pool_id', 'status_id']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('units');
}
