import { addTimestamps } from '../schemaHelpers.js';

/** Master mitra: perusahaan pembiayaan (leasing) pemilik unit. */
export function up(knex) {
  return knex.schema.createTable('partners', (table) => {
    table.increments('id');
    table.string('code', 20).notNullable().unique();
    table.string('name', 150).notNullable();
    table.string('contact_person', 100).nullable();
    table.string('phone', 30).nullable();
    table.string('email', 150).nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    addTimestamps(table, knex);
  });
}

export function down(knex) {
  return knex.schema.dropTable('partners');
}
