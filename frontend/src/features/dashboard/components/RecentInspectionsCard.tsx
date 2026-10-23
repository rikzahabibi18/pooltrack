import { ArrowRightIcon, ClipboardCheckIcon } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { GradeBadge } from '@/components/GradeBadge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NAV_ITEMS, unitDetailPath } from '@/config/navigation'
import { formatDate } from '@/lib/format'
import type { DashboardSummary } from '../types'

export function RecentInspectionsCard({ inspections }: { inspections: DashboardSummary['recent_inspections'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspeksi Terbaru</CardTitle>
        <CardDescription>Hasil inspeksi yang terakhir dicatat</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link to={NAV_ITEMS.inspections.path}>
              Lihat semua
              <ArrowRightIcon />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {inspections.length === 0 ? (
          <EmptyState icon={ClipboardCheckIcon} title="Belum ada inspeksi" />
        ) : (
          <ul className="divide-y">
            {inspections.map((inspection) => (
              <li key={inspection.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <Link to={unitDetailPath(inspection.unit_id)} className="font-semibold hover:underline">
                    {inspection.plate_number}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {inspection.brand} {inspection.model} · {inspection.pool_name} · {inspection.inspector_name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs whitespace-nowrap text-muted-foreground">{formatDate(inspection.inspection_date)}</span>
                  <GradeBadge code={inspection.grade_code} name={inspection.grade_name} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
