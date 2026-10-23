import { z } from 'zod';
import { AUTH } from '../../constants/auth.js';
import { requiredText } from '../../utils/zodHelpers.js';

// Batas panjang mengikuti kolom di migration create_users
const MAX = { NAME: 100, EMAIL: 150 };

/** Email disimpan huruf kecil supaya "Admin@X.com" dan "admin@x.com" dianggap sama. */
const emailField = z
  .string({ required_error: 'Email wajib diisi', invalid_type_error: 'Email wajib diisi' })
  .trim()
  .toLowerCase()
  .email('Format email tidak valid')
  .max(MAX.EMAIL, `Email maksimal ${MAX.EMAIL} karakter`);

/** POST /api/auth/register */
export const registerSchema = z.object({
  name: requiredText('Nama', { min: 3, max: MAX.NAME }),
  email: emailField,
  password: z
    .string({ required_error: 'Password wajib diisi', invalid_type_error: 'Password wajib diisi' })
    .min(AUTH.PASSWORD_MIN_LENGTH, `Password minimal ${AUTH.PASSWORD_MIN_LENGTH} karakter`)
    .max(AUTH.PASSWORD_MAX_LENGTH, `Password maksimal ${AUTH.PASSWORD_MAX_LENGTH} karakter`),
});

/** POST /api/auth/login — panjang password tidak dicek di sini, cukup dicocokkan dengan hash. */
export const loginSchema = z.object({
  email: emailField,
  password: z
    .string({ required_error: 'Password wajib diisi', invalid_type_error: 'Password wajib diisi' })
    .min(1, 'Password wajib diisi'),
});
