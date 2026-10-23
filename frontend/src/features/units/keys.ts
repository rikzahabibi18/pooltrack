import type { QueryParams } from '@/lib/api'

/** Query key unit (file terpisah supaya fitur inspeksi bisa memakainya tanpa import melingkar). */
export const unitKeys = {
  all: ['units'] as const,
  list: (params: QueryParams) => [...unitKeys.all, 'list', params] as const,
  detail: (id: number) => [...unitKeys.all, 'detail', id] as const,
  histories: (id: number) => [...unitKeys.detail(id), 'histories'] as const,
}
