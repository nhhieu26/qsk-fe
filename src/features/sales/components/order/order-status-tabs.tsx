import { ORDER_STATUSES } from "@/features/sales/constants"
import { ORDER_STATUS_KEYS } from "@/features/sales/lib/order-filters"
import type { OrderStatus, OrderStatusCounts } from "@/features/sales/types"
import { cn } from "@/lib/utils"

type OrderStatusTabsProps = {
  value: OrderStatus | undefined
  counts: OrderStatusCounts | undefined
  onChange: (value: OrderStatus | undefined) => void
}

const TABS: readonly { value: OrderStatus | undefined; label: string }[] = [
  { value: undefined, label: "Tất cả" },
  ...ORDER_STATUS_KEYS.map((s) => ({
    value: s,
    label: ORDER_STATUSES[s].label,
  })),
]

/** Tab trạng thái kiểu gạch chân, có số đơn theo bộ lọc đang áp dụng. */
export function OrderStatusTabs({
  value,
  counts,
  onChange,
}: OrderStatusTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Trạng thái đơn"
      className="flex gap-6 overflow-x-auto border-b px-[18px]"
    >
      {TABS.map((tab) => {
        const isActive = tab.value === value
        const count = counts?.[tab.value ?? "all"]
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 border-transparent pt-3 pb-[11px] text-[13.5px] font-semibold whitespace-nowrap text-muted-foreground hover:text-foreground",
              isActive && "border-primary text-foreground"
            )}
          >
            {tab.label}
            {count !== undefined && (
              <i
                className={cn(
                  "rounded-md bg-muted px-1.5 py-px text-[11.5px] font-semibold not-italic tabular-nums",
                  isActive && "bg-primary-soft text-primary"
                )}
              >
                {count}
              </i>
            )}
          </button>
        )
      })}
    </div>
  )
}
