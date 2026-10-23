import { useQuery } from '@tanstack/react-query'
import { getData } from '@/lib/api'
import { dashboardKeys } from './keys'
import type { DashboardSummary } from './types'

/**
 * Ringkasan dashboard. Otomatis dimuat ulang setiap ada perubahan unit/inspeksi
 * (fitur unit & inspeksi meng-invalidate dashboardKeys.all).
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: () => getData<DashboardSummary>('/dashboard/summary'),
  })
}
