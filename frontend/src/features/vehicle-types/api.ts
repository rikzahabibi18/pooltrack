import { deleteData, getList, postData, putData, type QueryParams } from '@/lib/api'
import type { VehicleTypeFormValues } from './schema'
import type { VehicleType } from './types'

const ENDPOINT = '/vehicle-types'

export const vehicleTypeApi = {
  list: (params: QueryParams) => getList<VehicleType>(ENDPOINT, params),
  create: (values: VehicleTypeFormValues) => postData<VehicleType>(ENDPOINT, values),
  update: (id: number, values: VehicleTypeFormValues) => putData<VehicleType>(`${ENDPOINT}/${id}`, values),
  remove: (id: number) => deleteData(`${ENDPOINT}/${id}`),
}
