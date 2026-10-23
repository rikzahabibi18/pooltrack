import { z } from 'zod'
import { todayISO } from '@/lib/date'
import type { Unit } from './types'

/** Sama dengan backend: "B 1234 XYZ", spasi boleh ada/tidak (backend yang merapikan). */
const PLATE_PATTERN = /^[A-Za-z]{1,2}\s*\d{1,4}\s*[A-Za-z]{0,3}$/
const MIN_YEAR = 1950

/** Nilai dropdown berupa teks id ("3") → dikirim sebagai angka. */
const selectId = (label: string) => z.string().min(1, `${label} wajib dipilih`).transform(Number)

const optionalText = (label: string, max: number) => z.string().trim().max(max, `${label} maksimal ${max} karakter`)

const pastOrTodayDate = (label: string) =>
  z
    .string()
    .min(1, `${label} wajib diisi`)
    .refine((value) => value <= todayISO(), `${label} tidak boleh melebihi hari ini`)

export const unitFormSchema = z.object({
  plate_number: z
    .string()
    .trim()
    .min(1, 'Nomor plat wajib diisi')
    .max(15, 'Nomor plat maksimal 15 karakter')
    .regex(PLATE_PATTERN, 'Format nomor plat tidak valid, contoh: B 1234 XYZ'),
  brand: z.string().trim().min(1, 'Merek wajib diisi').max(50, 'Merek maksimal 50 karakter'),
  model: z.string().trim().min(1, 'Model wajib diisi').max(80, 'Model maksimal 80 karakter'),
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'Tahun harus 4 digit angka')
    .transform(Number)
    .pipe(
      z
        .number()
        .min(MIN_YEAR, `Tahun minimal ${MIN_YEAR}`)
        .max(new Date().getFullYear() + 1, 'Tahun tidak boleh melebihi tahun depan'),
    ),
  color: optionalText('Warna', 30),
  chassis_number: optionalText('Nomor rangka', 50),
  engine_number: optionalText('Nomor mesin', 50),
  vehicle_type_id: selectId('Jenis kendaraan'),
  partner_id: selectId('Mitra'),
  /** Hanya dipakai saat tambah; saat ubah, pool diganti lewat "Pindah Pool". */
  pool_id: selectId('Pool'),
  received_at: pastOrTodayDate('Tanggal masuk'),
  notes: optionalText('Catatan', 1000),
})

export type UnitFormInput = z.input<typeof unitFormSchema>
export type UnitFormValues = z.output<typeof unitFormSchema>

export const toUnitFormInput = (unit?: Unit): UnitFormInput => ({
  plate_number: unit?.plate_number ?? '',
  brand: unit?.brand ?? '',
  model: unit?.model ?? '',
  year: unit ? String(unit.year) : '',
  color: unit?.color ?? '',
  chassis_number: unit?.chassis_number ?? '',
  engine_number: unit?.engine_number ?? '',
  vehicle_type_id: unit ? String(unit.vehicle_type.id) : '',
  partner_id: unit ? String(unit.partner.id) : '',
  pool_id: unit ? String(unit.pool.id) : '',
  received_at: unit?.received_at ?? todayISO(),
  notes: unit?.notes ?? '',
})

/** Form ubah status: hanya catatan opsional (status tujuan sudah ditentukan backend). */
export const changeStatusFormSchema = z.object({
  note: optionalText('Catatan', 200),
})
export type ChangeStatusFormValues = z.infer<typeof changeStatusFormSchema>

export const moveUnitFormSchema = z.object({
  pool_id: selectId('Pool tujuan'),
  note: optionalText('Catatan', 200),
})
export type MoveUnitFormInput = z.input<typeof moveUnitFormSchema>
export type MoveUnitFormValues = z.output<typeof moveUnitFormSchema>
