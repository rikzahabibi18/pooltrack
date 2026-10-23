import { Card, CardContent } from '@/components/ui/card'
import { formatNumber } from '@/lib/format'
import type { DashboardSummary } from '../types'

type StatusSummaryCardsProps = Pick<DashboardSummary, 'status_counts' | 'total_units' | 'total_active_units'>

/**
 * Kartu angka: total unit aktif + satu kartu per status.
 * Label, urutan, dan warna status dari API; angka tetap memakai warna teks biasa,
 * warna status hanya pada penanda kecil di samping label.
 */
export function StatusSummaryCards({ status_counts, total_units, total_active_units }: StatusSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <Card className="col-span-2 gap-1 lg:col-span-1">
        <CardContent className="space-y-1">
          <p className="text-sm text-muted-foreground">Unit aktif di pool</p>
          <p className="text-3xl font-semibold tabular-nums">{formatNumber(total_active_units)}</p>
          <p className="text-xs text-muted-foreground">dari {formatNumber(total_units)} unit tercatat</p>
        </CardContent>
      </Card>

      {status_counts.map((status) => (
        <Card key={status.id} className="gap-1">
          <CardContent className="space-y-1">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: status.color }} aria-hidden />
              {status.name}
            </p>
            <p className="text-3xl font-semibold tabular-nums">{formatNumber(status.total)}</p>
            <p className="text-xs text-muted-foreground">
              {status.counts_toward_capacity ? 'menempati pool' : 'sudah diserahkan'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
