import { ArrowRightIcon } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { OccupancyBar } from '@/components/OccupancyBar'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NAV_ITEMS } from '@/config/navigation'
import type { DashboardSummary } from '../types'

/** Okupansi tiap pool: unit aktif dibanding kapasitas (aturan bisnis 2). */
export function PoolOccupancyCard({ pools }: { pools: DashboardSummary['pool_occupancy'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Okupansi Pool</CardTitle>
        <CardDescription>Unit aktif dibanding kapasitas tiap pool</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link to={NAV_ITEMS.pools.path}>
              Kelola
              <ArrowRightIcon />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {pools.length === 0 ? (
          <EmptyState title="Belum ada pool" />
        ) : (
          <ul className="space-y-4">
            {pools.map((pool) => (
              <li key={pool.id} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{pool.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {pool.city}
                    {!pool.is_active && ' · nonaktif'}
                  </span>
                </div>
                <OccupancyBar occupied={pool.occupied} capacity={pool.capacity} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
