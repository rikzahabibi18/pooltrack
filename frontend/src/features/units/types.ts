type Ref = { id: number; code: string; name: string }

export type UnitStatusRef = Ref & { color: string; sequence: number }

/**
 * Aksi yang diizinkan untuk unit ini — DIHITUNG BACKEND.
 * Frontend cukup menampilkan/menonaktifkan tombol, tanpa tahu aturan bisnis atau kode status.
 */
export type UnitActions = {
  can_edit: boolean
  can_move: boolean
  can_inspect: boolean
  can_delete: boolean
  next_status: { id: number; name: string; color: string } | null
  can_change_status: boolean
  change_status_blocked_reason: string | null
}

/** Bentuk data unit dari API (/api/units). */
export type Unit = {
  id: number
  plate_number: string
  brand: string
  model: string
  year: number
  color: string | null
  chassis_number: string | null
  engine_number: string | null
  received_at: string
  released_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  inspection_count: number
  vehicle_type: Ref
  partner: Ref
  pool: Ref
  status: UnitStatusRef
  actions: UnitActions
}

export type UnitSort = 'received_at' | 'created_at' | 'plate_number' | 'brand' | 'year' | 'status' | 'pool'

type HistoryStatus = { id: number; code: string; name: string; color: string }

/** Satu baris riwayat (/api/units/:id/histories). from = to berarti pindah pool (keputusan H). */
export type UnitHistory = {
  id: number
  note: string | null
  changed_at: string
  from_status: HistoryStatus | null
  to_status: HistoryStatus
}
