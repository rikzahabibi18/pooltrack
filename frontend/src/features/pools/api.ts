import { deleteData, getList, postData, putData, type QueryParams } from '@/lib/api'
import type { PoolFormValues } from './schema'
import type { Pool } from './types'

const ENDPOINT = '/pools'

export const poolApi = {
  list: (params: QueryParams) => getList<Pool>(ENDPOINT, params),
  create: (values: PoolFormValues) => postData<Pool>(ENDPOINT, values),
  update: (id: number, values: PoolFormValues) => putData<Pool>(`${ENDPOINT}/${id}`, values),
  remove: (id: number) => deleteData(`${ENDPOINT}/${id}`),
}
