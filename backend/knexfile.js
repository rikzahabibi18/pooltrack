import { env } from './src/config/env.js';
import { DATABASE } from './src/constants/database.js';

/**
 * Konfigurasi Knex — dipakai oleh aplikasi (src/config/database.js)
 * dan oleh CLI (npm run migrate / seed).
 */
export default {
  client: 'mysql2',
  connection: {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    charset: 'utf8mb4',
    // Kolom DATE/TIMESTAMP dikembalikan sebagai string apa adanya,
    // sehingga tanggal tidak bergeser karena konversi timezone di JavaScript.
    dateStrings: true,
    // BOOLEAN di MariaDB disimpan sebagai TINYINT(1) (nilai 0/1).
    // Di sini diubah otomatis menjadi true/false agar JSON API rapi.
    typeCast(field, next) {
      if (field.type === 'TINY' && field.length === 1) {
        const value = field.string();
        return value === null ? null : value === '1';
      }
      return next();
    },
  },
  pool: {
    min: DATABASE.POOL_MIN,
    max: DATABASE.POOL_MAX,
    // Setiap koneksi baru memakai zona waktu dari .env (mis. +07:00 = WIB), supaya
    // CURRENT_TIMESTAMP (created_at, changed_at) sama di laptop, Docker, maupun server cloud (UTC).
    afterCreate(connection, done) {
      connection.query('SET time_zone = ?', [env.db.timezone], (error) => done(error, connection));
    },
  },
  acquireConnectionTimeout: DATABASE.ACQUIRE_TIMEOUT_MS,
  migrations: {
    directory: './src/database/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './src/database/seeds',
  },
};
