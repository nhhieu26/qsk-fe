import { LogOutIcon, UsersIcon } from "lucide-react"
import { NavLink, useMatch } from "react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useCurrentUser, useLogout } from "@/features/auth/hooks/use-auth"

export function AdminSidebar() {
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const isMembers = !!useMatch("/members")

  return (
    <Sidebar>
      <SidebarHeader className="px-4 pt-5 pb-3">
        <img
          src="/logo.png"
          alt="Quầy Sức Khỏe"
          className="h-14 w-auto self-start"
        />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider uppercase">
            Khách hàng
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isMembers}
                className="h-10 rounded-[9px] font-medium"
              >
                <NavLink to="/members">
                  <UsersIcon />
                  <span>Hội viên</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-10 rounded-[9px]"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
              tooltip={user?.fullName ?? user?.phoneNumber}
            >
              <LogOutIcon />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
