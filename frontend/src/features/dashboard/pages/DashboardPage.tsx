import { RefreshCwIcon } from 'lucide-react'
import { ErrorState } from '@/components/ErrorState'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { NAV_ITEMS } from '@/config/navigation'
import { cn } from '@/lib/utils'
import { PoolOccupancyCard } from '../components/PoolOccupancyCard'
import { RecentInspectionsCard } from '../components/RecentInspectionsCard'
import { StatusSummaryCards } from '../components/StatusSummaryCards'
import { UnitsByPartnerChart } from '../components/UnitsByPartnerChart'
import { useDashboardSummary } from '../hooks'

const SUMMARY_CARD_COUNT = 5

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: SUMMARY_CARD_COUNT }, (_, index) => (
          <Skeleton key={index} className={cn('h-28', index === 0 && 'col-span-2 lg:col-span-1')} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-64" />
    </>
  )
}

/** Ringkasan untuk Manajer Operasional — semua angka dihitung backend (/api/dashboard/summary). */
export function DashboardPage() {
  const { title, description } = NAV_ITEMS.dashboard
  const summary = useDashboardSummary()

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button variant="outline" onClick={() => summary.refetch()} disabled={summary.isFetching}>
            <RefreshCwIcon className={cn(summary.isFetching && 'animate-spin')} />
            Muat ulang
          </Button>
        }
      />

      {summary.isPending && <DashboardSkeleton />}

      {summary.isError && (
        <Card>
          <CardContent>
            <ErrorState error={summary.error} onRetry={() => summary.refetch()} />
          </CardContent>
        </Card>
      )}

      {summary.data && (
        <>
          <StatusSummaryCards
            status_counts={summary.data.status_counts}
            total_units={summary.data.total_units}
            total_active_units={summary.data.total_active_units}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <PoolOccupancyCard pools={summary.data.pool_occupancy} />
            <UnitsByPartnerChart data={summary.data.units_by_partner} />
          </div>
          <RecentInspectionsCard inspections={summary.data.recent_inspections} />
        </>
      )}
    </>
  )
}
