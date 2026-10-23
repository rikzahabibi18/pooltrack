import { z } from 'zod'

/**
 * Satu-satunya tempat membaca environment variable frontend.
 * Jika ada yang kurang, aplikasi langsung gagal dengan pesan jelas di console.
 */
const envSchema = z.object({
  VITE_API_URL: z.string().url('VITE_API_URL harus berupa URL, mis. http://localhost:4000/api'),
  VITE_APP_NAME: z.string().min(1, 'VITE_APP_NAME wajib diisi'),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`).join('\n')
  throw new Error(`Konfigurasi .env frontend tidak valid. Salin .env.example menjadi .env.\n${details}`)
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL,
  appName: parsed.data.VITE_APP_NAME,
} as const
