import { NavLink } from "react-router"

import { NAV_GROUPS, type NavItem } from "@/app/navigation"
import { usePermissions } from "@/features/access/use-permissions"
import { cn } from "@/lib/utils"

type SidebarNavProps = {
  /** Gọi khi chọn một mục (để đóng sheet trên mobile). */
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { can } = usePermissions()

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => can(item.permission)),
  })).filter((group) => group.items.length > 0)

  return (
    <nav aria-label="Điều hướng chính" className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.id}>
          {group.label && (
            <div
              id={`nav-group-${group.id}`}
              className="mb-1 px-3 text-[11px] font-semibold tracking-[.06em] text-muted-foreground/80 uppercase"
            >
              {group.label}
            </div>
          )}
          <ul
            aria-labelledby={group.label ? `nav-group-${group.id}` : undefined}
            className="grid gap-0.5"
          >
            {group.items.map((item) => (
              <li key={item.path}>
                <SidebarLink item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function SidebarLink({
  item,
  onNavigate,
}: {
  item: NavItem
  onNavigate?: () => void
}) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-muted hover:text-foreground",
          isActive &&
            "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-[inset_2px_0_0_var(--primary)]"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            aria-hidden="true"
            strokeWidth={1.8}
            className={cn(
              "size-[18px] text-muted-foreground",
              isActive && "text-primary"
            )}
          />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}
