import { deleteData, getList, postData, putData, type QueryParams } from '@/lib/api'
import type { PartnerFormValues } from './schema'
import type { Partner } from './types'

const ENDPOINT = '/partners'

export const partnerApi = {
  list: (params: QueryParams) => getList<Partner>(ENDPOINT, params),
  create: (values: PartnerFormValues) => postData<Partner>(ENDPOINT, values),
  update: (id: number, values: PartnerFormValues) => putData<Partner>(`${ENDPOINT}/${id}`, values),
  remove: (id: number) => deleteData(`${ENDPOINT}/${id}`),
}
