import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LIST_DEFAULTS } from '@/config/constants'
import type { SortOrder } from '@/hooks/useListParams'
import { cn } from '@/lib/utils'

export type DataTableColumn<T, TSort extends string = string> = {
  key: string
  header: string
  cell: (row: T) => ReactNode
  /** Isi jika kolom bisa diurutkan; nilainya = nilai ?sort= di backend. */
  sortKey?: TSort
  className?: string
}

type DataTableProps<T, TSort extends string> = {
  columns: DataTableColumn<T, TSort>[]
  rows: T[] | undefined
  rowKey: (row: T) => string | number
  /** Pertama kali memuat (belum ada data sama sekali) → tampil skeleton. */
  isLoading: boolean
  /** Sedang memuat ulang (data lama masih tampil) → tabel diredupkan. */
  isRefreshing?: boolean
  sorting?: { sort: TSort; order: SortOrder }
  onSort?: (sortKey: TSort) => void
  emptyState: ReactNode
}

/** Satu komponen tabel untuk semua halaman list (UI guideline: konsisten). */
export function DataTable<T, TSort extends string = string>({
  columns,
  rows,
  rowKey,
  isLoading,
  isRefreshing = false,
  sorting,
  onSort,
  emptyState,
}: DataTableProps<T, TSort>) {
  return (
    <div className={cn('transition-opacity', isRefreshing && 'pointer-events-none opacity-60')}>
      <Table className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {columns.map((column) => {
              const isSorted = sorting?.sort === column.sortKey
              const SortIcon = !isSorted ? ChevronsUpDownIcon : sorting?.order === 'asc' ? ArrowUpIcon : ArrowDownIcon
              return (
                <TableHead
                  key={column.key}
                  className={column.className}
                  aria-sort={isSorted ? (sorting?.order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {column.sortKey && onSort ? (
                    <button
                      type="button"
                      className={cn('inline-flex items-center gap-1 hover:text-foreground', isSorted && 'text-foreground')}
                      onClick={() => onSort(column.sortKey as TSort)}
                    >
                      {column.header}
                      <SortIcon className="size-3.5" aria-hidden />
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: LIST_DEFAULTS.PAGE_SIZE }, (_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton className="h-4 w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && rows?.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length}>{emptyState}</TableCell>
            </TableRow>
          )}

          {!isLoading &&
            rows?.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
