import { LogOutIcon } from 'lucide-react'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { useAuth } from '@/features/auth/auth-context'

/** Bagian bawah sidebar: siapa yang sedang login + tombol keluar. */
export function SidebarUser() {
  const { user, logout } = useAuth()
  if (!user) return null

  const initial = user.name.trim().charAt(0).toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium">
            {initial}
          </div>
          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={logout} tooltip="Keluar">
          <LogOutIcon />
          <span>Keluar</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
