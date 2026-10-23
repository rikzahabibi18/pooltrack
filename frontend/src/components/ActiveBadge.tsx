import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/** Status aktif/nonaktif data master. */
export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5',
        isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground',
      )}
    >
      <span className={cn('size-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-muted-foreground/50')} />
      {isActive ? 'Aktif' : 'Nonaktif'}
    </Badge>
  )
}
