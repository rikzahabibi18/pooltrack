import { deleteData, getData, getList, postData, putData, type QueryParams } from '@/lib/api'
import type { InspectionFormValues } from './schema'
import type { Inspection } from './types'

const ENDPOINT = '/inspections'

export const inspectionApi = {
  list: (params: QueryParams) => getList<Inspection>(ENDPOINT, params),
  listByUnit: (unitId: number) => getData<Inspection[]>(`/units/${unitId}/inspections`),
  /** Inspeksi selalu milik satu unit, jadi dibuat lewat endpoint unit. */
  createForUnit: (unitId: number, values: InspectionFormValues) =>
    postData<Inspection & { unit_status_changed: boolean }>(`/units/${unitId}/inspections`, values),
  update: (id: number, values: InspectionFormValues) => putData<Inspection>(`${ENDPOINT}/${id}`, values),
  remove: (id: number) => deleteData(`${ENDPOINT}/${id}`),
}
