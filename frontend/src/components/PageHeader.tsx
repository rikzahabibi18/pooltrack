import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  /** Elemen kecil di samping judul, mis. badge status unit. */
  badge?: ReactNode
  /** Tombol aksi di kanan, mis. "Tambah Unit". */
  actions?: ReactNode
}

export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
