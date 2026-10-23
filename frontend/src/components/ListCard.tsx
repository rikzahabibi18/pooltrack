import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

type ListCardProps = {
  /** Pencarian & filter di bagian atas kartu. */
  toolbar: ReactNode
  children: ReactNode
}

/** Kartu standar halaman list: toolbar di atas, tabel + pagination di bawah. */
export function ListCard({ toolbar, children }: ListCardProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:flex-wrap sm:items-center">{toolbar}</div>
      {children}
    </Card>
  )
}
