import type { QueryParams } from '@/lib/api'

export const inspectionKeys = {
  all: ['inspections'] as const,
  list: (params: QueryParams) => [...inspectionKeys.all, 'list', params] as const,
  byUnit: (unitId: number) => [...inspectionKeys.all, 'unit', unitId] as const,
}
