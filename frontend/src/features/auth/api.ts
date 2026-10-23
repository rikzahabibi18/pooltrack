import { getData, postData } from '@/lib/api'
import type { LoginFormValues, RegisterFormValues } from './schema'
import type { AuthResult, AuthUser } from './types'

export const authApi = {
  login: (values: LoginFormValues) => postData<AuthResult>('/auth/login', values),
  /** confirm_password tidak dikirim — hanya untuk validasi di browser. */
  register: ({ name, email, password }: RegisterFormValues) =>
    postData<AuthResult>('/auth/register', { name, email, password }),
  me: () => getData<AuthUser>('/auth/me'),
}
