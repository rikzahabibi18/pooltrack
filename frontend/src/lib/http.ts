import axios, { AxiosError } from 'axios'
import { API_TIMEOUT_MS } from '@/config/constants'
import { getToken } from '@/lib/auth-token'
import { env } from '@/lib/env'

/* ---------- Tipe kontrak API (sama untuk semua endpoint) ---------- */

export type FieldError = { field: string; message: string }

export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number }

export type ApiResponse<T> = { success: true; message: string; data: T; meta?: PaginationMeta }

type ApiErrorBody = { success: false; message: string; errors?: FieldError[] }

/** Error yang sudah diseragamkan, sehingga komponen tidak perlu tahu detail axios. */
export class ApiError extends Error {
  status: number
  errors: FieldError[]

  constructor(status: number, message: string, errors: FieldError[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

const NETWORK_ERROR_MESSAGE = 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.'
const HTTP_UNAUTHORIZED = 401

/* ---------- Penanganan sesi berakhir ---------- */

type UnauthorizedHandler = (message: string) => void
let onUnauthorized: UnauthorizedHandler | null = null

/** Didaftarkan oleh AuthProvider: dipanggil saat token ditolak server (kedaluwarsa / tidak valid). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler
}

/* ---------- Instance axios tunggal ---------- */

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
})

// Setiap request otomatis membawa token (jika sudah login)
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (!error.response) {
      return Promise.reject(new ApiError(0, NETWORK_ERROR_MESSAGE))
    }
    const { status, data } = error.response
    const message = data?.message ?? error.message

    // 401 pada request yang membawa token = sesi berakhir → keluarkan pengguna.
    // (401 saat login dengan password salah tidak membawa token, jadi tidak ikut tertangkap di sini.)
    if (status === HTTP_UNAUTHORIZED && error.config?.headers?.Authorization) {
      onUnauthorized?.(message)
    }

    return Promise.reject(new ApiError(status, message, data?.errors ?? []))
  },
)
