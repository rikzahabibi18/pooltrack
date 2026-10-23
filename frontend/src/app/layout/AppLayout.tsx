import { Outlet } from 'react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

/** Kerangka semua halaman: sidebar kiri, header, lalu isi halaman (Outlet). */
export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* min-w-0: tanpa ini, flex item ikut melebar mengikuti tabel lebar → muncul scroll horizontal halaman */}
      <SidebarInset className="min-w-0">
        <AppHeader />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
