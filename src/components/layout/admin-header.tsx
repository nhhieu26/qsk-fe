import { BellIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useCurrentUser } from "@/features/auth/hooks/use-auth"
import type { Role } from "@/types/user"

const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Quản trị viên",
  midu: "Nhân viên Midu",
  agency: "Đại lý",
  customer: "Khách lẻ",
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export function AdminHeader() {
  const { data: user } = useCurrentUser()
  const name = user?.fullName ?? user?.phoneNumber ?? ""

  return (
    <header className="flex h-[60px] shrink-0 items-center gap-3 border-b bg-card px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="ml-auto flex items-center gap-4">
        <span className="hidden text-sm font-medium sm:block">
          {dateFormatter.format(new Date())}
        </span>
        <Button variant="outline" size="icon" aria-label="Thông báo">
          <BellIcon />
        </Button>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-sky-400 text-white">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">
              {user ? ROLE_LABELS[user.role] : ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
