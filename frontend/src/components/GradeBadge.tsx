import { Badge } from '@/components/ui/badge'

/** Grade inspeksi, mis. "B · Baik" (kode & nama dari API). */
export function GradeBadge({ code, name }: { code: string; name: string }) {
  return (
    <Badge variant="secondary" className="gap-1 font-normal">
      <span className="font-semibold">{code}</span>
      <span className="text-muted-foreground">·</span>
      {name}
    </Badge>
  )
}
