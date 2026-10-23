import { WarehouseIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { APP_TAGLINE } from '@/config/constants'
import { isNavItemActive, NAV_GROUPS, NAV_ITEMS } from '@/config/navigation'
import { env } from '@/lib/env'
import { SidebarUser } from './SidebarUser'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()

  // Di HP sidebar berupa panel geser; tutup otomatis setelah memilih menu.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={NAV_ITEMS.dashboard.path} onClick={closeOnMobile}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <WarehouseIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{env.appName}</span>
                  <span className="truncate text-xs text-muted-foreground">{APP_TAGLINE}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isNavItemActive(item.path, pathname)} tooltip={item.title}>
                      <Link to={item.path} onClick={closeOnMobile}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
