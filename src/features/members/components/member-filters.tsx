import { cn } from "@/lib/utils"
import type { MemberRole } from "@/features/members/api/members"

type Filter = MemberRole | undefined

export function MemberFilters({
  value,
  onChange,
  counts,
}: {
  value: Filter
  onChange: (value: Filter) => void
  counts?: Record<MemberRole, number>
}) {
  const items: { value: Filter; label: string }[] = [
    { value: undefined, label: "Tất cả" },
    {
      value: "customer",
      label: `Khách lẻ${counts ? ` · ${counts.customer}` : ""}`,
    },
    {
      value: "agency",
      label: `Khách đại lý${counts ? ` · ${counts.agency}` : ""}`,
    },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
            value === item.value &&
              "border-primary/30 bg-sidebar-accent text-primary hover:text-primary"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
