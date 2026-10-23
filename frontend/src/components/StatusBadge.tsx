import { Badge } from '@/components/ui/badge'

type StatusBadgeProps = {
  name: string
  /** Warna dari tabel unit_statuses (mis. #2563EB) — frontend tidak menentukan warna sendiri. */
  color: string
}

/** Badge status unit; label & warna sepenuhnya dari API (aturan tanpa hardcode no. 3). */
export function StatusBadge({ name, color }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="gap-1.5 font-medium"
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </Badge>
  )
}
