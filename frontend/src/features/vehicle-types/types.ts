/** Bentuk data jenis kendaraan dari API (/api/vehicle-types). */
export type VehicleType = {
  id: number
  code: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type VehicleTypeSort = 'code' | 'name' | 'created_at'
