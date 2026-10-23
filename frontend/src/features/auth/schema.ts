import { z } from 'zod'
import { PASSWORD_RULES } from '@/config/constants'

const email = z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid').max(150, 'Email maksimal 150 karakter')

export const loginFormSchema = z.object({
  email,
  password: z.string().min(1, 'Password wajib diisi'),
})
export type LoginFormValues = z.infer<typeof loginFormSchema>

export const registerFormSchema = z
  .object({
    name: z.string().trim().min(3, 'Nama minimal 3 karakter').max(100, 'Nama maksimal 100 karakter'),
    email,
    password: z
      .string()
      .min(PASSWORD_RULES.MIN_LENGTH, `Password minimal ${PASSWORD_RULES.MIN_LENGTH} karakter`)
      .max(PASSWORD_RULES.MAX_LENGTH, `Password maksimal ${PASSWORD_RULES.MAX_LENGTH} karakter`),
    /** Hanya dicek di browser; tidak dikirim ke backend. */
    confirm_password: z.string().min(1, 'Ulangi password'),
  })
  .refine((values) => values.password === values.confirm_password, {
    path: ['confirm_password'],
    message: 'Password tidak sama',
  })
export type RegisterFormValues = z.infer<typeof registerFormSchema>
