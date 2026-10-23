import { ArrowRightLeftIcon } from 'lucide-react'
import { ErrorState } from '@/components/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/format'
import { useUnitHistories } from '../hooks'
import type { UnitHistory } from '../types'

/** Riwayat dengan status asal = tujuan adalah catatan pindah pool (keputusan H). */
const isPoolMove = (history: UnitHistory) => history.from_status?.id === history.to_status.id

/** Timeline riwayat status unit, urut dari kejadian paling awal. */
export function UnitStatusTimeline({ unitId }: { unitId: number }) {
  const histories = useUnitHistories(unitId)

  if (histories.isPending) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }
  if (histories.isError) return <ErrorState error={histories.error} onRetry={() => histories.refetch()} />

  return (
    <ol className="relative space-y-5 border-l pl-6">
      {histories.data.map((history) => {
        const move = isPoolMove(history)
        return (
          <li key={history.id} className="relative">
            <span
              className="absolute top-1 -left-[1.95rem] flex size-4 items-center justify-center rounded-full border-2 border-background"
              style={{ backgroundColor: move ? 'var(--muted-foreground)' : history.to_status.color }}
              aria-hidden
            />
            <div className="flex flex-col gap-0.5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                {move && <ArrowRightLeftIcon className="size-3.5 text-muted-foreground" aria-hidden />}
                {move ? 'Pindah pool' : history.to_status.name}
                {!move && history.from_status && (
                  <span className="font-normal text-muted-foreground">dari {history.from_status.name}</span>
                )}
              </p>
              {history.note && <p className="text-sm text-muted-foreground">{history.note}</p>}
              <time className="text-xs text-muted-foreground">{formatDateTime(history.changed_at)}</time>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
