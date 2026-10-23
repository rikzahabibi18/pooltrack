import 'dotenv/config';
import { z } from 'zod';

/**
 * Semua environment variable dibaca dan divalidasi DI SINI SAJA.
 * Jika ada yang kurang/salah, aplikasi langsung berhenti dengan pesan jelas
 * (lebih baik gagal saat start daripada error aneh saat sudah berjalan).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().positive(),
  CORS_ORIGIN: z.string().min(1),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1),
  /** Offset zona waktu sesi database, mis. +07:00 (WIB). */
  DB_TIMEZONE: z.string().regex(/^[+-]\d{2}:\d{2}$/, 'format harus seperti +07:00'),

  /** Kunci rahasia untuk menandatangani token login. Wajib panjang & acak. */
  JWT_SECRET: z.string().min(32, 'minimal 32 karakter acak'),
  /** Masa berlaku token, mis. 8h (8 jam) atau 1d (1 hari). */
  JWT_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/, 'format harus seperti 8h atau 1d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Konfigurasi .env tidak valid. Salin .env.example menjadi .env lalu periksa:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const values = parsed.data;

export const env = Object.freeze({
  nodeEnv: values.NODE_ENV,
  isProduction: values.NODE_ENV === 'production',
  port: values.PORT,
  corsOrigins: values.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  db: Object.freeze({
    host: values.DB_HOST,
    port: values.DB_PORT,
    user: values.DB_USER,
    password: values.DB_PASSWORD,
    name: values.DB_NAME,
    timezone: values.DB_TIMEZONE,
  }),
  auth: Object.freeze({
    jwtSecret: values.JWT_SECRET,
    jwtExpiresIn: values.JWT_EXPIRES_IN,
  }),
});
