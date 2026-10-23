import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { dashboardKeys } from '@/features/dashboard/keys'
import { unitKeys } from '@/features/units/keys'
import { useApiMutation } from '@/hooks/useApiMutation'
import type { QueryParams } from '@/lib/api'
import { inspectionApi } from './api'
import { inspectionKeys } from './keys'
import type { InspectionFormValues } from './schema'

/** Inspeksi pertama bisa mengubah status unit (aturan 4), jadi data unit & dashboard ikut di-refresh. */
const AFFECTED_BY_INSPECTION_CHANGE = [inspectionKeys.all, unitKeys.all, dashboardKeys.all]

export function useInspections(params: QueryParams) {
  return useQuery({
    queryKey: inspectionKeys.list(params),
    queryFn: () => inspectionApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useUnitInspections(unitId: number) {
  return useQuery({
    queryKey: inspectionKeys.byUnit(unitId),
    queryFn: () => inspectionApi.listByUnit(unitId),
  })
}

type SaveInspectionVariables =
  | { mode: 'create'; unitId: number; values: InspectionFormValues }
  | { mode: 'update'; inspectionId: number; values: InspectionFormValues }

export function useSaveInspection() {
  return useApiMutation({
    mutationFn: (variables: SaveInspectionVariables) =>
      variables.mode === 'create'
        ? inspectionApi.createForUnit(variables.unitId, variables.values)
        : inspectionApi.update(variables.inspectionId, variables.values),
    invalidateKeys: AFFECTED_BY_INSPECTION_CHANGE,
  })
}

export function useDeleteInspection() {
  return useApiMutation({
    mutationFn: (id: number) => inspectionApi.remove(id),
    invalidateKeys: AFFECTED_BY_INSPECTION_CHANGE,
  })
}
