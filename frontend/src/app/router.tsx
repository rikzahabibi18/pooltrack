import { createBrowserRouter, type RouteObject } from 'react-router'
import { AUTH_ROUTES, NAV_ITEMS, UNIT_DETAIL_ROUTE } from '@/config/navigation'
import { AppLayout } from './layout/AppLayout'
import { AuthLayout } from './layout/AuthLayout'
import { NotFoundPage } from './NotFoundPage'
import { GuestOnly, RequireAuth } from './RouteGuards'

/**
 * Path diambil dari NAV_ITEMS & AUTH_ROUTES, jadi menu sidebar dan route tidak mungkin berbeda.
 * Setiap halaman di-load saat dibuka (lazy), supaya bundle awal tetap kecil.
 */

/** Halaman yang bisa dibuka tanpa login. */
const guestPages: RouteObject[] = [
  {
    path: AUTH_ROUTES.login,
    lazy: () => import('@/features/auth/pages/LoginPage').then((m) => ({ Component: m.LoginPage })),
  },
  {
    path: AUTH_ROUTES.register,
    lazy: () => import('@/features/auth/pages/RegisterPage').then((m) => ({ Component: m.RegisterPage })),
  },
]

/** Halaman dashboard (wajib login). */
const dashboardPages: RouteObject[] = [
  {
    path: NAV_ITEMS.dashboard.path,
    lazy: () => import('@/features/dashboard/pages/DashboardPage').then((m) => ({ Component: m.DashboardPage })),
  },
  {
    path: NAV_ITEMS.units.path,
    lazy: () => import('@/features/units/pages/UnitsPage').then((m) => ({ Component: m.UnitsPage })),
  },
  {
    path: UNIT_DETAIL_ROUTE,
    lazy: () => import('@/features/units/pages/UnitDetailPage').then((m) => ({ Component: m.UnitDetailPage })),
  },
  {
    path: NAV_ITEMS.inspections.path,
    lazy: () => import('@/features/inspections/pages/InspectionsPage').then((m) => ({ Component: m.InspectionsPage })),
  },
  {
    path: NAV_ITEMS.partners.path,
    lazy: () => import('@/features/partners/pages/PartnersPage').then((m) => ({ Component: m.PartnersPage })),
  },
  {
    path: NAV_ITEMS.pools.path,
    lazy: () => import('@/features/pools/pages/PoolsPage').then((m) => ({ Component: m.PoolsPage })),
  },
  {
    path: NAV_ITEMS.vehicleTypes.path,
    lazy: () => import('@/features/vehicle-types/pages/VehicleTypesPage').then((m) => ({ Component: m.VehicleTypesPage })),
  },
  { path: '*', element: <NotFoundPage /> },
]

export const router = createBrowserRouter([
  // Belum login → layout login/register. Sudah login → diarahkan ke dashboard.
  { element: <GuestOnly />, children: [{ element: <AuthLayout />, children: guestPages }] },

  // Sudah login → layout dashboard. Belum login → diarahkan ke halaman login.
  { element: <RequireAuth />, children: [{ element: <AppLayout />, children: dashboardPages }] },
])
