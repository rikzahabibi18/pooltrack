import { useMemo, useState } from 'react'
import { LIST_DEFAULTS } from '@/config/constants'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

export type SortOrder = 'asc' | 'desc'

type Filters = Record<string, string | undefined>

type Options<TSort extends string> = {
  sort: TSort
  order: SortOrder
}

/**
 * State standar halaman list: halaman, pencarian, urutan, dan filter.
 * Setiap perubahan pencarian/urutan/filter otomatis kembali ke halaman 1.
 * `params` siap dikirim ke API: { page, limit, search, sort, order, ...filter }.
 */
export function useListParams<TSort extends string>(initial: Options<TSort>) {
  const [page, setPage] = useState(1)
  const [search, setSearchValue] = useState('')
  const [sorting, setSorting] = useState(initial)
  const [filters, setFilters] = useState<Filters>({})
  const debouncedSearch = useDebouncedValue(search.trim(), LIST_DEFAULTS.SEARCH_DEBOUNCE_MS)

  const setSearch = (value: string) => {
    setSearchValue(value)
    setPage(1)
  }

  /** Klik header yang sama membalik urutan; header lain mulai dari A→Z. */
  const toggleSort = (column: TSort) => {
    setSorting((current) =>
      current.sort === column
        ? { sort: column, order: current.order === 'asc' ? 'desc' : 'asc' }
        : { sort: column, order: 'asc' },
    )
    setPage(1)
  }

  const setFilter = (name: string, value: string | undefined) => {
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  const resetFilters = () => {
    setSearchValue('')
    setFilters({})
    setPage(1)
  }

  /**
   * Jika data di halaman terakhir habis (mis. baris terakhir dihapus), mundur ke halaman yang ada.
   * Dipanggil saat render dengan totalPages dari response.
   */
  const clampPage = (totalPages: number) => {
    const lastPage = Math.max(1, totalPages)
    if (page > lastPage) setPage(lastPage)
  }

  const params = useMemo(
    () => ({
      page,
      limit: LIST_DEFAULTS.PAGE_SIZE,
      search: debouncedSearch || undefined,
      sort: sorting.sort,
      order: sorting.order,
      ...filters,
    }),
    [page, debouncedSearch, sorting, filters],
  )

  const hasActiveFilters = search.trim() !== '' || Object.values(filters).some(Boolean)

  return {
    params,
    page,
    setPage,
    search,
    setSearch,
    sorting,
    toggleSort,
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    clampPage,
  }
}
