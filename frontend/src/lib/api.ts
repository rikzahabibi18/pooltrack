import { http, type ApiResponse, type PaginationMeta } from '@/lib/http'

/**
 * Fungsi pemanggil API yang dipakai semua fitur (features/<fitur>/api.ts).
 * - Query (GET) mengembalikan isi `data` saja.
 * - Mutation (POST/PUT/PATCH/DELETE) mengembalikan response utuh, supaya `message`
 *   dari backend bisa langsung ditampilkan sebagai toast.
 */

export type QueryParams = Record<string, string | number | boolean | undefined | null>

export type ListResult<T> = { data: T[]; meta: PaginationMeta }

/** Buang parameter kosong supaya URL bersih: ?page=1&search= → ?page=1 */
function compactParams(params: QueryParams = {}) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))
}

export async function getList<T>(url: string, params?: QueryParams): Promise<ListResult<T>> {
  const { data } = await http.get<ApiResponse<T[]>>(url, { params: compactParams(params) })
  return { data: data.data, meta: data.meta as PaginationMeta }
}

export async function getData<T>(url: string, params?: QueryParams): Promise<T> {
  const { data } = await http.get<ApiResponse<T>>(url, { params: compactParams(params) })
  return data.data
}

export async function postData<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  const { data } = await http.post<ApiResponse<T>>(url, body)
  return data
}

export async function putData<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  const { data } = await http.put<ApiResponse<T>>(url, body)
  return data
}

export async function patchData<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  const { data } = await http.patch<ApiResponse<T>>(url, body)
  return data
}

export async function deleteData(url: string): Promise<ApiResponse<{ id: number }>> {
  const { data } = await http.delete<ApiResponse<{ id: number }>>(url)
  return data
}
