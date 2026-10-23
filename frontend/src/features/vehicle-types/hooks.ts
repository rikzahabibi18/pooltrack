import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { OPTIONS_LIMIT } from '@/config/constants'
import { useApiMutation } from '@/hooks/useApiMutation'
import type { QueryParams } from '@/lib/api'
import { vehicleTypeApi } from './api'
import type { VehicleTypeFormValues } from './schema'

export const vehicleTypeKeys = {
  all: ['vehicle-types'] as const,
  list: (params: QueryParams) => [...vehicleTypeKeys.all, 'list', params] as const,
}

export function useVehicleTypes(params: QueryParams) {
  return useQuery({
    queryKey: vehicleTypeKeys.list(params),
    queryFn: () => vehicleTypeApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/** Pilihan dropdown. Default hanya jenis kendaraan aktif. */
export function useVehicleTypeOptions({ activeOnly = true } = {}) {
  const params = { is_active: activeOnly ? true : undefined, limit: OPTIONS_LIMIT, sort: 'name', order: 'asc' }
  return useQuery({
    queryKey: vehicleTypeKeys.list(params),
    queryFn: () => vehicleTypeApi.list(params),
    select: (result) => result.data,
  })
}

export function useSaveVehicleType() {
  return useApiMutation({
    mutationFn: ({ id, values }: { id?: number; values: VehicleTypeFormValues }) =>
      id ? vehicleTypeApi.update(id, values) : vehicleTypeApi.create(values),
    invalidateKeys: [vehicleTypeKeys.all],
  })
}

export function useDeleteVehicleType() {
  return useApiMutation({
    mutationFn: (id: number) => vehicleTypeApi.remove(id),
    invalidateKeys: [vehicleTypeKeys.all],
  })
}
