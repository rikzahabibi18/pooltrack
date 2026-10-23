import type { LucideIcon } from 'lucide-react'
import { InboxIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

/** Tampilan saat data kosong / tidak ditemukan. Dipakai di semua halaman list. */
export function EmptyState({ icon: Icon = InboxIcon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
