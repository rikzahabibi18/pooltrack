import { addForeignKey, addTimestamps } from '../schemaHelpers.js';

/** Hasil inspeksi kondisi unit. Satu unit boleh diinspeksi lebih dari sekali. */
export function up(knex) {
  return knex.schema.createTable('inspections', (table) => {
    table.increments('id');
    addForeignKey(table, 'unit_id', 'units');
    table.date('inspection_date').notNullable();
    table.string('inspector_name', 100).notNullable();
    table.integer('odometer_km').unsigned().nullable();
    table.text('exterior_notes').nullable();
    table.text('interior_notes').nullable();
    table.text('engine_notes').nullable();
    addForeignKey(table, 'grade_id', 'inspection_grades');
    table.text('notes').nullable();
    addTimestamps(table, knex);

    table.index(['unit_id', 'inspection_date']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('inspections');
}
