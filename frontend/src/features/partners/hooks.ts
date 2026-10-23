import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { OPTIONS_LIMIT } from '@/config/constants'
import { useApiMutation } from '@/hooks/useApiMutation'
import type { QueryParams } from '@/lib/api'
import { partnerApi } from './api'
import type { PartnerFormValues } from './schema'

/** Query key terpusat: invalidasi ['partners'] me-refresh semua query mitra. */
export const partnerKeys = {
  all: ['partners'] as const,
  list: (params: QueryParams) => [...partnerKeys.all, 'list', params] as const,
}

/** Daftar mitra untuk tabel. keepPreviousData: data lama tetap tampil saat ganti halaman. */
export function usePartners(params: QueryParams) {
  return useQuery({
    queryKey: partnerKeys.list(params),
    queryFn: () => partnerApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/**
 * Pilihan dropdown. Default hanya mitra aktif (keputusan E: untuk form data baru);
 * `activeOnly: false` dipakai filter list supaya data lama tetap bisa dicari.
 */
export function usePartnerOptions({ activeOnly = true } = {}) {
  const params = { is_active: activeOnly ? true : undefined, limit: OPTIONS_LIMIT, sort: 'name', order: 'asc' }
  return useQuery({
    queryKey: partnerKeys.list(params),
    queryFn: () => partnerApi.list(params),
    select: (result) => result.data,
  })
}

export function useSavePartner() {
  return useApiMutation({
    mutationFn: ({ id, values }: { id?: number; values: PartnerFormValues }) =>
      id ? partnerApi.update(id, values) : partnerApi.create(values),
    invalidateKeys: [partnerKeys.all],
  })
}

export function useDeletePartner() {
  return useApiMutation({
    mutationFn: (id: number) => partnerApi.remove(id),
    invalidateKeys: [partnerKeys.all],
  })
}
