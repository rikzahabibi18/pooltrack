import { z } from 'zod'
import type { Partner } from './types'

/**
 * Validasi form di browser (untuk UX). Backend tetap memvalidasi ulang,
 * dan error dari backend ditampilkan di field yang sama.
 */
export const partnerFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Kode minimal 2 karakter')
    .max(20, 'Kode maksimal 20 karakter')
    .regex(/^[A-Za-z0-9_-]+$/, 'Kode hanya boleh huruf, angka, - atau _'),
  name: z.string().trim().min(3, 'Nama mitra minimal 3 karakter').max(150, 'Nama mitra maksimal 150 karakter'),
  contact_person: z.string().trim().max(100, 'Nama kontak maksimal 100 karakter'),
  phone: z
    .string()
    .trim()
    .max(30, 'Telepon maksimal 30 karakter')
    .regex(/^([0-9+()\-\s]{6,})?$/, 'Telepon hanya boleh angka, spasi, +, -, dan tanda kurung'),
  email: z.string().trim().max(150, 'Email maksimal 150 karakter').email('Format email tidak valid').or(z.literal('')),
  is_active: z.boolean(),
})

export type PartnerFormValues = z.infer<typeof partnerFormSchema>

/** Nilai awal form: kosong untuk tambah, data mitra untuk ubah (null → ''). */
export const toPartnerFormValues = (partner?: Partner): PartnerFormValues => ({
  code: partner?.code ?? '',
  name: partner?.name ?? '',
  contact_person: partner?.contact_person ?? '',
  phone: partner?.phone ?? '',
  email: partner?.email ?? '',
  is_active: partner?.is_active ?? true,
})
