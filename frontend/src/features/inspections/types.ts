/** Bentuk data inspeksi dari API (/api/inspections, /api/units/:id/inspections). */
export type Inspection = {
  id: number
  inspection_date: string
  inspector_name: string
  odometer_km: number | null
  exterior_notes: string | null
  interior_notes: string | null
  engine_notes: string | null
  notes: string | null
  created_at: string
  updated_at: string
  unit: {
    id: number
    plate_number: string
    brand: string
    model: string
    pool: { id: number; name: string }
  }
  grade: { id: number; code: string; name: string }
}

export type InspectionSort = 'inspection_date' | 'created_at' | 'plate_number' | 'grade'
