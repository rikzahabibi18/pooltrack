/** Bentuk data GET /api/dashboard/summary — semua angka dihitung backend. */
export type DashboardSummary = {
  status_counts: {
    id: number
    code: string
    name: string
    color: string
    sequence: number
    counts_toward_capacity: boolean
    total: number
  }[]
  total_units: number
  total_active_units: number
  pool_occupancy: {
    id: number
    code: string
    name: string
    city: string
    capacity: number
    occupied: number
    is_active: boolean
  }[]
  units_by_partner: { id: number; code: string; name: string; total: number }[]
  recent_inspections: {
    id: number
    inspection_date: string
    inspector_name: string
    unit_id: number
    plate_number: string
    brand: string
    model: string
    pool_name: string
    grade_code: string
    grade_name: string
  }[]
}
