import { addTimestamps } from '../schemaHelpers.js';

/** Master jenis kendaraan, mis. MOTOR, MOBIL, TRUK. */
export function up(knex) {
  return knex.schema.createTable('vehicle_types', (table) => {
    table.increments('id');
    table.string('code', 20).notNullable().unique();
    table.string('name', 50).notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    addTimestamps(table, knex);
  });
}

export function down(knex) {
  return knex.schema.dropTable('vehicle_types');
}
