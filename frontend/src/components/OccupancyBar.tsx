import { OCCUPANCY_THRESHOLD } from '@/config/constants'
import { formatNumber, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

type OccupancyBarProps = {
  occupied: number
  capacity: number
}

/** Bar okupansi pool: hijau (aman), kuning (hampir penuh), merah (penuh). */
export function OccupancyBar({ occupied, capacity }: OccupancyBarProps) {
  const ratio = capacity > 0 ? occupied / capacity : 0
  const isFull = ratio >= OCCUPANCY_THRESHOLD.FULL
  const tone = isFull ? 'bg-destructive' : ratio >= OCCUPANCY_THRESHOLD.WARNING ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="min-w-36 space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium tabular-nums">
          {formatNumber(occupied)} / {formatNumber(capacity)} unit
        </span>
        <span className={cn('tabular-nums', isFull ? 'font-medium text-destructive' : 'text-muted-foreground')}>
          {isFull ? 'Penuh' : formatPercent(ratio)}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={occupied}
        aria-label="Okupansi pool"
      >
        <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
      </div>
    </div>
  )
}
