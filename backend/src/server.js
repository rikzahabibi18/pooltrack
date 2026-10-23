import { createApp } from './app.js';
import { checkDatabaseConnection, closeDatabase } from './config/database.js';
import { env } from './config/env.js';
import { API_PREFIX } from './constants/api.js';

async function start() {
  try {
    await checkDatabaseConnection();
    console.log(`Terhubung ke MariaDB ${env.db.host}:${env.db.port}/${env.db.name}`);
  } catch (error) {
    console.error(`Gagal terhubung ke database (${error.code ?? error.message}).`);
    console.error('Pastikan MariaDB berjalan (docker compose up -d db) dan nilai DB_* di .env benar.');
    await closeDatabase();
    process.exit(1);
  }

  const server = createApp().listen(env.port, () => {
    console.log(`API berjalan di http://localhost:${env.port}${API_PREFIX} (${env.nodeEnv})`);
  });

  // Tutup server & koneksi database dengan rapi saat proses dihentikan (Ctrl+C / Docker stop)
  const shutdown = (signal) => {
    console.log(`\n${signal} diterima, menutup server...`);
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
