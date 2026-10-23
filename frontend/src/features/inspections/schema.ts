import { z } from 'zod'
import { todayISO } from '@/lib/date'
import type { Inspection } from './types'

const MAX_ODOMETER_KM = 9_999_999
const optionalText = (label: string) => z.string().trim().max(1000, `${label} maksimal 1000 karakter`)

/**
 * `minDate` = tanggal unit masuk; inspeksi tidak mungkin sebelum unit diterima.
 * Backend tetap memeriksa ulang aturan yang sama.
 */
export const createInspectionFormSchema = (minDate?: string) =>
  z.object({
    inspection_date: z
      .string()
      .min(1, 'Tanggal inspeksi wajib diisi')
      .refine((value) => value <= todayISO(), 'Tanggal inspeksi tidak boleh melebihi hari ini')
      .refine((value) => !minDate || value >= minDate, `Tanggal inspeksi tidak boleh sebelum unit masuk (${minDate})`),
    inspector_name: z.string().trim().min(3, 'Nama inspektor minimal 3 karakter').max(100, 'Nama inspektor maksimal 100 karakter'),
    odometer_km: z
      .string()
      .trim()
      .regex(/^\d*$/, 'Odometer harus bilangan bulat')
      .transform((value) => (value === '' ? null : Number(value)))
      .pipe(z.number().max(MAX_ODOMETER_KM, `Odometer maksimal ${MAX_ODOMETER_KM}`).nullable()),
    grade_id: z.string().min(1, 'Grade wajib dipilih').transform(Number),
    exterior_notes: optionalText('Kondisi eksterior'),
    interior_notes: optionalText('Kondisi interior'),
    engine_notes: optionalText('Kondisi mesin'),
    notes: optionalText('Catatan'),
  })

type InspectionFormSchema = ReturnType<typeof createInspectionFormSchema>
export type InspectionFormInput = z.input<InspectionFormSchema>
export type InspectionFormValues = z.output<InspectionFormSchema>

export const toInspectionFormInput = (inspection?: Inspection): InspectionFormInput => ({
  inspection_date: inspection?.inspection_date ?? todayISO(),
  inspector_name: inspection?.inspector_name ?? '',
  odometer_km: inspection?.odometer_km != null ? String(inspection.odometer_km) : '',
  grade_id: inspection ? String(inspection.grade.id) : '',
  exterior_notes: inspection?.exterior_notes ?? '',
  interior_notes: inspection?.interior_notes ?? '',
  engine_notes: inspection?.engine_notes ?? '',
  notes: inspection?.notes ?? '',
})
