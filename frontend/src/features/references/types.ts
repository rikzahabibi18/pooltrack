/** Referensi status unit (/api/references/unit-statuses) — label, urutan, dan warna dari database. */
export type UnitStatus = {
  id: number
  code: string
  name: string
  sequence: number
  counts_toward_capacity: boolean
  color: string
}

/** Referensi grade inspeksi (/api/references/inspection-grades). */
export type InspectionGrade = {
  id: number
  code: string
  name: string
  description: string | null
}
