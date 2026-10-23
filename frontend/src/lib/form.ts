import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '@/lib/http'

/**
 * Menampilkan error per-field dari backend langsung di bawah input yang sesuai.
 * Contoh: 409 { errors: [{ field: "code", message: "Kode \"DMS\" sudah digunakan" }] }
 */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
  if (!(error instanceof ApiError)) return
  for (const { field, message } of error.errors) {
    setError(field as Path<T>, { type: 'server', message })
  }
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak terduga'
}
