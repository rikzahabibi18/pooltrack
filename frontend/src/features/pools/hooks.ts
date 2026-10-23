import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { OPTIONS_LIMIT } from '@/config/constants'
import { useApiMutation } from '@/hooks/useApiMutation'
import type { QueryParams } from '@/lib/api'
import { poolApi } from './api'
import type { PoolFormValues } from './schema'

/** Okupansi berubah saat unit masuk/keluar/pindah → fitur unit juga meng-invalidate ['pools']. */
export const poolKeys = {
  all: ['pools'] as const,
  list: (params: QueryParams) => [...poolKeys.all, 'list', params] as const,
}

export function usePools(params: QueryParams) {
  return useQuery({
    queryKey: poolKeys.list(params),
    queryFn: () => poolApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/** Pilihan dropdown lengkap dengan okupansinya. Default hanya pool aktif. */
export function usePoolOptions({ activeOnly = true } = {}) {
  const params = { is_active: activeOnly ? true : undefined, limit: OPTIONS_LIMIT, sort: 'name', order: 'asc' }
  return useQuery({
    queryKey: poolKeys.list(params),
    queryFn: () => poolApi.list(params),
    select: (result) => result.data,
  })
}

export function useSavePool() {
  return useApiMutation({
    mutationFn: ({ id, values }: { id?: number; values: PoolFormValues }) =>
      id ? poolApi.update(id, values) : poolApi.create(values),
    invalidateKeys: [poolKeys.all],
  })
}

export function useDeletePool() {
  return useApiMutation({
    mutationFn: (id: number) => poolApi.remove(id),
    invalidateKeys: [poolKeys.all],
  })
}
