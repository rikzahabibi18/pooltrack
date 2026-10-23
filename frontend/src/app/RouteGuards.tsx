import { Navigate, Outlet, useLocation } from 'react-router'
import { AUTH_ROUTES, NAV_ITEMS } from '@/config/navigation'
import { useAuth } from '@/features/auth/auth-context'
import { FullPageLoader } from './FullPageLoader'

/** State yang dibawa ke halaman login, supaya setelah login kembali ke halaman semula. */
export type LoginRedirectState = { from?: string }

/** Halaman dashboard: hanya untuk yang sudah login. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader />
  if (status === 'guest') {
    const state: LoginRedirectState = { from: location.pathname }
    return <Navigate to={AUTH_ROUTES.login} replace state={state} />
  }
  return <Outlet />
}

/**
 * Halaman login & register: yang sudah login langsung diarahkan keluar dari sini —
 * ke halaman yang tadi ingin dibuka (jika ada), atau ke dashboard.
 * Komponen inilah yang memindahkan pengguna setelah login/register berhasil.
 */
export function GuestOnly() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader />
  if (status === 'authenticated') {
    const from = (location.state as LoginRedirectState | null)?.from
    return <Navigate to={from ?? NAV_ITEMS.dashboard.path} replace />
  }
  return <Outlet />
}
