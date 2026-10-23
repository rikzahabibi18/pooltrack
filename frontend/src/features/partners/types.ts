/** Bentuk data mitra dari API (/api/partners). */
export type Partner = {
  id: number
  code: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/** Nilai ?sort= yang diterima backend. */
export type PartnerSort = 'code' | 'name' | 'created_at'
