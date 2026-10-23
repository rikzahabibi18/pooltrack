/** Pengguna yang sedang login (dari API — tanpa password). */
export type AuthUser = {
  id: number
  name: string
  email: string
  created_at: string
}

/** Response POST /api/auth/login & /api/auth/register. */
export type AuthResult = {
  user: AuthUser
  token: string
}

/**
 * - loading       : sedang memeriksa token yang tersimpan (saat aplikasi baru dibuka)
 * - authenticated : sudah login
 * - guest         : belum login
 */
export type AuthStatus = 'loading' | 'authenticated' | 'guest'
