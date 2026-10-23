/** Bentuk data pool dari API (/api/pools). `occupied` = jumlah unit aktif, dihitung backend. */
export type Pool = {
  id: number
  code: string
  name: string
  city: string
  address: string | null
  capacity: number
  occupied: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type PoolSort = 'code' | 'name' | 'city' | 'capacity' | 'occupied' | 'created_at'
