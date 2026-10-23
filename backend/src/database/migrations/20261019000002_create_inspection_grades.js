/** Referensi grade hasil inspeksi A–D (diisi seeder, read-only via API). */
export function up(knex) {
  return knex.schema.createTable('inspection_grades', (table) => {
    table.increments('id');
    table.specificType('code', 'CHAR(1)').notNullable().unique();
    table.string('name', 50).notNullable();
    table.string('description', 255).nullable();
  });
}

export function down(knex) {
  return knex.schema.dropTable('inspection_grades');
}
