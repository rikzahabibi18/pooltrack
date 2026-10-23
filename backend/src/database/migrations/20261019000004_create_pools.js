import { addTimestamps } from '../schemaHelpers.js';

/** Master pool: lokasi penyimpanan unit beserta kapasitasnya. */
export function up(knex) {
  return knex.schema.createTable('pools', (table) => {
    table.increments('id');
    table.string('code', 20).notNullable().unique();
    table.string('name', 100).notNullable();
    table.string('city', 100).notNullable();
    table.text('address').nullable();
    table.integer('capacity').unsigned().notNullable().checkPositive(); // CHECK (capacity > 0)
    table.boolean('is_active').notNullable().defaultTo(true);
    addTimestamps(table, knex);
  });
}

export function down(knex) {
  return knex.schema.dropTable('pools');
}
