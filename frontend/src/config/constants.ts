/** Konstanta UI & jaringan di satu tempat (bukan angka acak di dalam komponen). */

export const APP_TAGLINE = 'Manajemen Unit Aset'

/** Format angka & tanggal Indonesia. */
export const APP_LOCALE = 'id-ID'

export const API_TIMEOUT_MS = 15_000

/** Nama key localStorage untuk menyimpan token login. */
export const AUTH_TOKEN_STORAGE_KEY = 'pooltrack.auth-token'

/** Aturan password sama dengan backend (bcrypt hanya memakai 72 byte pertama). */
export const PASSWORD_RULES = { MIN_LENGTH: 8, MAX_LENGTH: 72 } as const

export const TOAST_POSITION = 'top-right'

export const QUERY_DEFAULTS = {
  /** Data dianggap segar selama 30 detik sebelum di-refetch otomatis. */
  STALE_TIME_MS: 30_000,
  RETRY: 1,
} as const

export const LIST_DEFAULTS = {
  PAGE_SIZE: 10,
  /** Jeda sebelum pencarian dikirim ke server, supaya tidak request di setiap ketikan. */
  SEARCH_DEBOUNCE_MS: 400,
} as const

/** Batas maksimal `limit` di backend; dipakai untuk mengambil semua opsi dropdown. */
export const OPTIONS_LIMIT = 100

/** Ambang warna bar okupansi pool (rasio terisi / kapasitas). */
export const OCCUPANCY_THRESHOLD = {
  WARNING: 0.8,
  FULL: 1,
} as const

/**
 * Pilihan filter status aktif. Ini filter boolean milik UI (bukan data master),
 * jadi boleh didefinisikan di frontend.
 */
export const ACTIVE_FILTER_OPTIONS = [
  { value: 'true', label: 'Aktif' },
  { value: 'false', label: 'Nonaktif' },
]
