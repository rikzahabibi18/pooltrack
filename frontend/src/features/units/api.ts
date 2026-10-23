import { deleteData, getData, getList, patchData, postData, putData, type QueryParams } from '@/lib/api'
import type { MoveUnitFormValues, UnitFormValues } from './schema'
import type { Unit, UnitHistory } from './types'

const ENDPOINT = '/units'

export const unitApi = {
  list: (params: QueryParams) => getList<Unit>(ENDPOINT, params),
  detail: (id: number) => getData<Unit>(`${ENDPOINT}/${id}`),
  histories: (id: number) => getData<UnitHistory[]>(`${ENDPOINT}/${id}/histories`),
  create: (values: UnitFormValues) => postData<Unit>(ENDPOINT, values),
  /** pool_id ikut terkirim tetapi diabaikan backend (keputusan B). */
  update: (id: number, values: UnitFormValues) => putData<Unit>(`${ENDPOINT}/${id}`, values),
  remove: (id: number) => deleteData(`${ENDPOINT}/${id}`),
  changeStatus: (id: number, body: { to_status_id: number; note: string }) =>
    patchData<Unit>(`${ENDPOINT}/${id}/status`, body),
  move: (id: number, values: MoveUnitFormValues) => patchData<Unit>(`${ENDPOINT}/${id}/move`, values),
}
