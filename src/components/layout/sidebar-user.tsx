import { UserAvatar } from "@/components/common/user-avatar"
import { useCurrentUser, useLogout } from "@/features/auth/hooks/use-auth"
import { displayName, roleLabel } from "@/features/auth/lib/user-display"

export function SidebarUser() {
  const { data: user } = useCurrentUser()
  const logout = useLogout()

  if (!user) return null
  const name = displayName(user)

  return (
    <div className="mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-0.5 border-t px-2 pt-3.5">
      <UserAvatar name={name} className="size-[34px]" />
      <div className="min-w-0 flex-1">
        <b className="block truncate text-[13px] font-semibold text-foreground">
          {name}
        </b>
        <span className="text-xs text-muted-foreground">{roleLabel(user)}</span>
      </div>
      <button
        type="button"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
        className="pt-2 text-[12.5px] font-semibold text-primary hover:text-primary/80 disabled:opacity-50"
      >
        Đăng xuất
      </button>
    </div>
  )
}
