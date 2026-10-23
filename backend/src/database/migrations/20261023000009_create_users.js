import { addTimestamps } from '../schemaHelpers.js';

/**
 * Pengguna aplikasi (login sederhana, semua pengguna punya akses yang sama).
 * Password TIDAK pernah disimpan apa adanya — hanya hash bcrypt-nya.
 */
export function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('name', 100).notNullable();
    table.string('email', 150).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    addTimestamps(table, knex);
  });
}

export function down(knex) {
  return knex.schema.dropTable('users');
}
