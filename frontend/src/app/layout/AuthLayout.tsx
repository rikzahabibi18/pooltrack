import { WarehouseIcon } from 'lucide-react'
import { Outlet } from 'react-router'
import { APP_TAGLINE } from '@/config/constants'
import { env } from '@/lib/env'

/** Kerangka halaman login & register: logo di atas, kartu form di tengah. */
export function AuthLayout() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <WarehouseIcon className="size-5" aria-hidden />
        </div>
        <div className="leading-tight">
          <p className="text-lg font-semibold">{env.appName}</p>
          <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
        </div>
      </div>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </main>
  )
}
