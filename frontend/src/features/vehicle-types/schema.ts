import { z } from 'zod'
import type { VehicleType } from './types'

export const vehicleTypeFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Kode minimal 2 karakter')
    .max(20, 'Kode maksimal 20 karakter')
    .regex(/^[A-Za-z0-9_-]+$/, 'Kode hanya boleh huruf, angka, - atau _'),
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
  is_active: z.boolean(),
})

export type VehicleTypeFormValues = z.infer<typeof vehicleTypeFormSchema>

export const toVehicleTypeFormValues = (vehicleType?: VehicleType): VehicleTypeFormValues => ({
  code: vehicleType?.code ?? '',
  name: vehicleType?.name ?? '',
  is_active: vehicleType?.is_active ?? true,
})
