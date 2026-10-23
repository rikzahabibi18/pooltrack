import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { dashboardKeys } from '@/features/dashboard/keys'
import { inspectionKeys } from '@/features/inspections/keys'
import { poolKeys } from '@/features/pools/hooks'
import { useApiMutation } from '@/hooks/useApiMutation'
import type { QueryParams } from '@/lib/api'
import { unitApi } from './api'
import { unitKeys } from './keys'
import type { MoveUnitFormValues, UnitFormValues } from './schema'

/**
 * Perubahan unit memengaruhi data lain: okupansi pool, daftar inspeksi, dan dashboard.
 * Semuanya di-refresh supaya angka di seluruh aplikasi selalu konsisten.
 */
const AFFECTED_BY_UNIT_CHANGE = [unitKeys.all, poolKeys.all, inspectionKeys.all, dashboardKeys.all]

export function useUnits(params: QueryParams) {
  return useQuery({
    queryKey: unitKeys.list(params),
    queryFn: () => unitApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useUnit(id: number) {
  return useQuery({
    queryKey: unitKeys.detail(id),
    queryFn: () => unitApi.detail(id),
    // id dari URL bisa saja tidak valid (mis. /units/abc) → jangan kirim request
    enabled: Number.isInteger(id) && id > 0,
  })
}

export function useUnitHistories(id: number) {
  return useQuery({
    queryKey: unitKeys.histories(id),
    queryFn: () => unitApi.histories(id),
  })
}

export function useSaveUnit() {
  return useApiMutation({
    mutationFn: ({ id, values }: { id?: number; values: UnitFormValues }) =>
      id ? unitApi.update(id, values) : unitApi.create(values),
    invalidateKeys: AFFECTED_BY_UNIT_CHANGE,
  })
}

export function useDeleteUnit() {
  return useApiMutation({
    mutationFn: (id: number) => unitApi.remove(id),
    invalidateKeys: AFFECTED_BY_UNIT_CHANGE,
  })
}

export function useChangeUnitStatus() {
  return useApiMutation({
    mutationFn: ({ id, toStatusId, note }: { id: number; toStatusId: number; note: string }) =>
      unitApi.changeStatus(id, { to_status_id: toStatusId, note }),
    invalidateKeys: AFFECTED_BY_UNIT_CHANGE,
  })
}

export function useMoveUnit() {
  return useApiMutation({
    mutationFn: ({ id, values }: { id: number; values: MoveUnitFormValues }) => unitApi.move(id, values),
    invalidateKeys: AFFECTED_BY_UNIT_CHANGE,
  })
}
