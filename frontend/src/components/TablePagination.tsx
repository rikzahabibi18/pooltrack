import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'
import type { PaginationMeta } from '@/lib/http'

type TablePaginationProps = {
  meta: PaginationMeta | undefined
  onPageChange: (page: number) => void
}

export function TablePagination({ meta, onPageChange }: TablePaginationProps) {
  if (!meta || meta.total === 0) return null

  const { page, limit, total, totalPages } = meta
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row">
      <p>
        Menampilkan {formatNumber(from)}–{formatNumber(to)} dari {formatNumber(total)} data
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeftIcon />
          Sebelumnya
        </Button>
        <span className="tabular-nums">
          {page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Berikutnya
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}
