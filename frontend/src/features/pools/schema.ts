import { z } from 'zod'
import type { Pool } from './types'

const MAX_CAPACITY = 100_000

/**
 * Schema form pool. Kapasitas diketik sebagai teks lalu diubah ke angka.
 * `minCapacity` = jumlah unit aktif saat ini (keputusan G), supaya kesalahan
 * terlihat di browser sebelum dikirim. Backend tetap memeriksa ulang.
 */
export const createPoolFormSchema = (minCapacity = 1) =>
  z.object({
    code: z
      .string()
      .trim()
      .min(2, 'Kode minimal 2 karakter')
      .max(20, 'Kode maksimal 20 karakter')
      .regex(/^[A-Za-z0-9_-]+$/, 'Kode hanya boleh huruf, angka, - atau _'),
    name: z.string().trim().min(3, 'Nama pool minimal 3 karakter').max(100, 'Nama pool maksimal 100 karakter'),
    city: z.string().trim().min(2, 'Kota minimal 2 karakter').max(100, 'Kota maksimal 100 karakter'),
    address: z.string().trim().max(500, 'Alamat maksimal 500 karakter'),
    capacity: z
      .string()
      .trim()
      .min(1, 'Kapasitas wajib diisi')
      .regex(/^\d+$/, 'Kapasitas harus bilangan bulat')
      .transform(Number)
      .pipe(
        z
          .number()
          .min(Math.max(minCapacity, 1), minCapacity > 1 ? `Minimal ${minCapacity} sesuai jumlah unit aktif` : 'Kapasitas minimal 1')
          .max(MAX_CAPACITY, `Kapasitas maksimal ${MAX_CAPACITY}`),
      ),
    is_active: z.boolean(),
  })

export type PoolFormSchema = ReturnType<typeof createPoolFormSchema>
/** Nilai di dalam form (kapasitas masih teks). */
export type PoolFormInput = z.input<PoolFormSchema>
/** Nilai yang dikirim ke API (kapasitas sudah angka). */
export type PoolFormValues = z.output<PoolFormSchema>

export const toPoolFormInput = (pool?: Pool): PoolFormInput => ({
  code: pool?.code ?? '',
  name: pool?.name ?? '',
  city: pool?.city ?? '',
  address: pool?.address ?? '',
  capacity: pool ? String(pool.capacity) : '',
  is_active: pool?.is_active ?? true,
})
