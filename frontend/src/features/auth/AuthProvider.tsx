import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { clearToken, getToken, setToken } from '@/lib/auth-token'
import { setUnauthorizedHandler } from '@/lib/http'
import { authApi } from './api'
import { AuthContext, type AuthContextValue } from './auth-context'
import type { AuthResult, AuthStatus, AuthUser } from './types'

/**
 * Menyimpan siapa yang sedang login untuk seluruh aplikasi.
 *
 * Saat aplikasi dibuka: jika ada token tersimpan, cek ke GET /api/auth/me.
 * Token masih berlaku → langsung masuk; tidak berlaku → hapus token, tampilkan halaman login.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() => (getToken() ? 'loading' : 'guest'))

  const startSession = useCallback((result: AuthResult) => {
    setToken(result.token)
    setUser(result.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setStatus('guest')
    // Buang semua data yang sudah dimuat, supaya pengguna berikutnya tidak melihat data lama
    queryClient.clear()
  }, [queryClient])

  // Periksa token yang tersimpan sekali saat aplikasi dibuka
  useEffect(() => {
    if (!getToken()) return
    authApi
      .me()
      .then((currentUser) => {
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch(() => {
        clearToken()
        setStatus('guest')
      })
  }, [])

  // Token ditolak server di tengah pemakaian (mis. kedaluwarsa) → keluar + beri tahu
  useEffect(() => {
    setUnauthorizedHandler((message) => {
      logout()
      toast.error(message)
    })
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login: async (values) => {
        const response = await authApi.login(values)
        startSession(response.data)
        toast.success(`Selamat datang, ${response.data.user.name}`)
      },
      register: async (values) => {
        const response = await authApi.register(values)
        startSession(response.data)
        toast.success(response.message)
      },
      logout: () => {
        logout()
        toast.success('Anda telah keluar')
      },
    }),
    [user, status, startSession, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
