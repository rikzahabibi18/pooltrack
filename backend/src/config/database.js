import knex from 'knex';
import knexConfig from '../../knexfile.js';

/** Satu instance Knex untuk seluruh aplikasi (berisi connection pool). */
export const db = knex(knexConfig);

/** Memastikan database bisa dihubungi. Dipanggil saat server start dan oleh /health. */
export async function checkDatabaseConnection() {
  await db.raw('SELECT 1');
}

export const closeDatabase = () => db.destroy();
