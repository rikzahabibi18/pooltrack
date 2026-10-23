import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { API_PREFIX } from './constants/api.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import routes from './routes.js';

/**
 * Membuat aplikasi Express. Dipisah dari server.js supaya app bisa diuji
 * tanpa harus membuka port / koneksi database.
 */
export function createApp() {
  const app = express();

  app.use(helmet()); // header keamanan standar
  app.use(cors({ origin: env.corsOrigins })); // hanya origin frontend yang diizinkan
  app.use(express.json()); // parse body JSON
  if (!env.isProduction) app.use(morgan('dev')); // log request di terminal saat development

  app.use(API_PREFIX, routes);

  app.use(notFound); // harus setelah semua route
  app.use(errorHandler); // harus paling akhir

  return app;
}
