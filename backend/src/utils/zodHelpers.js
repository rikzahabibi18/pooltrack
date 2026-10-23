import { z } from 'zod';
import { isValidDateString, todayDate } from './date.js';

/**
 * Pembangun field Zod yang dipakai ulang oleh semua modul,
 * supaya pesan validasi konsisten dan dalam Bahasa Indonesia.
 */

const PHONE_PATTERN = /^[0-9+()\-\s]{6,}$/;
const CODE_PATTERN = /^[A-Za-z0-9_-]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
/** Plat nomor Indonesia: 1–2 huruf wilayah, 1–4 angka, 0–3 huruf seri. Spasi boleh ada/tidak. */
const PLATE_PATTERN = /^([A-Z]{1,2})\s*(\d{1,4})\s*([A-Z]{0,3})$/;
const MIN_VEHICLE_YEAR = 1950;

const isBlank = (value) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

/** String kosong / tidak dikirim → null (untuk kolom opsional). */
const blankToNull = (value) => (isBlank(value) ? null : value);

/** :id di URL, mis. /api/partners/3 */
export const idParamSchema = z.object({
  id: z.coerce.number({ invalid_type_error: 'ID harus berupa angka' }).int().positive('ID tidak valid'),
});

export const requiredText = (label, { max, min = 1 }) =>
  z
    .string({ required_error: `${label} wajib diisi`, invalid_type_error: `${label} harus berupa teks` })
    .trim()
    .min(min, min > 1 ? `${label} minimal ${min} karakter` : `${label} wajib diisi`)
    .max(max, `${label} maksimal ${max} karakter`);

export const optionalText = (label, { max }) =>
  z.preprocess(
    blankToNull,
    z.string({ invalid_type_error: `${label} harus berupa teks` }).trim().max(max, `${label} maksimal ${max} karakter`).nullable(),
  );

export const optionalEmail = (label, { max }) =>
  z.preprocess(
    blankToNull,
    z
      .string({ invalid_type_error: `${label} harus berupa teks` })
      .trim()
      .email(`Format ${label.toLowerCase()} tidak valid`)
      .max(max, `${label} maksimal ${max} karakter`)
      .nullable(),
  );

export const optionalPhone = (label, { max }) =>
  z.preprocess(
    blankToNull,
    z
      .string({ invalid_type_error: `${label} harus berupa teks` })
      .trim()
      .max(max, `${label} maksimal ${max} karakter`)
      .regex(PHONE_PATTERN, `${label} hanya boleh berisi angka, spasi, +, -, dan tanda kurung (min. 6 karakter)`)
      .nullable(),
  );

/** Kode singkat master, mis. "DMS" — otomatis diubah ke huruf besar. */
export const codeField = (label, { max }) =>
  requiredText(label, { max, min: 2 })
    .regex(CODE_PATTERN, `${label} hanya boleh berisi huruf, angka, - atau _`)
    .transform((value) => value.toUpperCase());

export const positiveInt = (label, { max }) =>
  z.preprocess(
    (value) => (isBlank(value) ? undefined : typeof value === 'string' ? Number(value) : value),
    z
      .number({ required_error: `${label} wajib diisi`, invalid_type_error: `${label} harus berupa angka` })
      .int(`${label} harus bilangan bulat`)
      .positive(`${label} harus lebih dari 0`)
      .max(max, `${label} maksimal ${max}`),
  );

/** Angka bulat >= 0 yang boleh kosong, mis. odometer. */
export const optionalNonNegativeInt = (label, { max }) =>
  z.preprocess(
    (value) => (isBlank(value) ? null : typeof value === 'string' ? Number(value) : value),
    z
      .number({ invalid_type_error: `${label} harus berupa angka` })
      .int(`${label} harus bilangan bulat`)
      .min(0, `${label} tidak boleh negatif`)
      .max(max, `${label} maksimal ${max}`)
      .nullable(),
  );

/** ID relasi yang wajib dipilih dari dropdown, mis. partner_id. */
export const requiredId = (label) =>
  z.preprocess(
    (value) => (isBlank(value) ? undefined : typeof value === 'string' ? Number(value) : value),
    z
      .number({ required_error: `${label} wajib dipilih`, invalid_type_error: `${label} wajib dipilih` })
      .int(`${label} tidak valid`)
      .positive(`${label} tidak valid`),
  );

/** Filter ID opsional di query string, mis. ?pool_id=2 (kosong = tidak difilter). */
export const optionalIdQueryParam = z.preprocess(
  (value) => (isBlank(value) ? undefined : value),
  z.coerce.number({ invalid_type_error: 'Harus berupa angka' }).int().positive('ID tidak valid').optional(),
);

/** Tanggal YYYY-MM-DD yang tidak boleh melewati hari ini. */
export const pastOrTodayDate = (label) =>
  z
    .string({ required_error: `${label} wajib diisi`, invalid_type_error: `${label} wajib diisi` })
    .regex(DATE_PATTERN, `${label} harus berformat YYYY-MM-DD`)
    .refine(isValidDateString, `${label} bukan tanggal yang valid`)
    .refine((value) => value <= todayDate(), `${label} tidak boleh melebihi hari ini`);

/**
 * Plat nomor dinormalisasi ke format baku "B 1234 XYZ":
 * huruf besar dan satu spasi antar bagian, sehingga "b1234xyz" = "B 1234 XYZ".
 */
export const plateNumberField = (label, { max }) =>
  z
    .string({ required_error: `${label} wajib diisi`, invalid_type_error: `${label} wajib diisi` })
    .transform((value) => value.trim().toUpperCase())
    .pipe(z.string().min(1, `${label} wajib diisi`).max(max, `${label} maksimal ${max} karakter`))
    .refine((value) => PLATE_PATTERN.test(value), `Format ${label.toLowerCase()} tidak valid, contoh: B 1234 XYZ`)
    .transform((value) => {
      const [, region, number, series] = value.match(PLATE_PATTERN);
      return [region, number, series].filter(Boolean).join(' ');
    });

/** Tahun kendaraan: 1950 sampai tahun depan (model tahun depan sudah bisa beredar). */
export const vehicleYearField = (label) =>
  z.preprocess(
    (value) => (isBlank(value) ? undefined : typeof value === 'string' ? Number(value) : value),
    z
      .number({ required_error: `${label} wajib diisi`, invalid_type_error: `${label} harus berupa angka` })
      .int(`${label} harus bilangan bulat`)
      .min(MIN_VEHICLE_YEAR, `${label} minimal ${MIN_VEHICLE_YEAR}`)
      .refine((year) => year <= new Date().getFullYear() + 1, `${label} tidak boleh melebihi tahun depan`),
  );

export const booleanField = (label, { defaultValue }) =>
  z.boolean({ invalid_type_error: `${label} harus bernilai true atau false` }).default(defaultValue);

/** Filter boolean di query string: ?is_active=true / ?is_active=false */
export const booleanQueryParam = z
  .enum(['true', 'false'], { errorMap: () => ({ message: 'Nilai harus true atau false' }) })
  .transform((value) => value === 'true')
  .optional();
