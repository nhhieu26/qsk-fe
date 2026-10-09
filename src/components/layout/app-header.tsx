import { Bell } from "lucide-react"

import { MobileNav } from "@/components/layout/mobile-nav"
import { UserAvatar } from "@/components/common/user-avatar"
import { useCurrentUser } from "@/features/auth/hooks/use-auth"
import { displayName, roleLabel } from "@/features/auth/lib/user-display"
import { formatLongDate } from "@/lib/format"

type AppHeaderProps = {
  /** Số việc đang chờ xử lý; backend sẽ cấp sau. */
  pendingCount?: number
}

export function AppHeader({ pendingCount = 0 }: AppHeaderProps) {
  const { data: user } = useCurrentUser()
  const name = user ? displayName(user) : ""

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center gap-4 border-b bg-white/90 px-4 py-3 backdrop-blur-md sm:px-7 print:hidden">
      <MobileNav />
      <div className="flex-1" />
      <div className="hidden text-[13px] font-medium whitespace-nowrap text-secondary-foreground sm:block">
        {formatLongDate(new Date())}
      </div>
      <button
        type="button"
        aria-label={
          pendingCount > 0
            ? `${pendingCount} việc đang chờ`
            : "Không có việc chờ"
        }
        className="relative grid size-10 place-items-center rounded-[10px] border bg-white text-secondary-foreground hover:bg-muted"
      >
        <Bell className="size-[19px]" strokeWidth={1.8} />
        {pendingCount > 0 && (
          <i className="absolute -top-[5px] -right-[5px] grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-pink-600 px-1 text-[10.5px] font-bold text-white not-italic">
            {pendingCount}
          </i>
        )}
      </button>
      {user && (
        <div className="flex items-center gap-2.5 border-l pl-4 whitespace-nowrap">
          <UserAvatar name={name} />
          <div className="hidden xl:block">
            <b className="block text-[13px] leading-tight font-semibold">
              {name}
            </b>
            <span className="text-xs text-muted-foreground">
              {roleLabel(user)}
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
