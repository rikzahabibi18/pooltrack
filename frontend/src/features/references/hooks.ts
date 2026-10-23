import { useQuery } from '@tanstack/react-query'
import { getData } from '@/lib/api'
import type { InspectionGrade, UnitStatus } from './types'

/** Data referensi hampir tidak pernah berubah, jadi cukup dimuat sekali per sesi. */
const REFERENCE_STALE_TIME = Infinity

export const referenceKeys = {
  unitStatuses: ['references', 'unit-statuses'] as const,
  inspectionGrades: ['references', 'inspection-grades'] as const,
}

export function useUnitStatuses() {
  return useQuery({
    queryKey: referenceKeys.unitStatuses,
    queryFn: () => getData<UnitStatus[]>('/references/unit-statuses'),
    staleTime: REFERENCE_STALE_TIME,
  })
}

export function useInspectionGrades() {
  return useQuery({
    queryKey: referenceKeys.inspectionGrades,
    queryFn: () => getData<InspectionGrade[]>('/references/inspection-grades'),
    staleTime: REFERENCE_STALE_TIME,
  })
}
