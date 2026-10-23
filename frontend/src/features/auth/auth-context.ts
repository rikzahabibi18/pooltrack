import { createContext, useContext } from 'react'
import type { LoginFormValues, RegisterFormValues } from './schema'
import type { AuthStatus, AuthUser } from './types'

export type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  login: (values: LoginFormValues) => Promise<void>
  register: (values: RegisterFormValues) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/** Akses data login dari komponen mana pun: const { user, logout } = useAuth() */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return context
}
