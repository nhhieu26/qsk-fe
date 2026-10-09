import {
  PRODUCT_CATEGORIES,
  UNCATEGORIZED_COLOR,
} from "@/features/products/constants"
import { CATEGORY_KEYS } from "@/features/products/lib/product-compliance"
import {
  matchesCategory,
  type CategoryFilter,
} from "@/features/products/lib/product-filters"
import type { Product } from "@/features/products/types"
import { cn } from "@/lib/utils"

const ALL_COLOR = ["#16326B", "#EEF1F6"] as const

export type CategoryNavOption = {
  value: CategoryFilter
  label: string
  count: number
  color: readonly [string, string]
}

export function categoryNavOptions(
  products: readonly Product[]
): CategoryNavOption[] {
  const count = (f: CategoryFilter) =>
    products.filter((p) => matchesCategory(p, f)).length
  const options: CategoryNavOption[] = [
    {
      value: "all",
      label: "Tất cả sản phẩm",
      count: products.length,
      color: ALL_COLOR,
    },
    ...CATEGORY_KEYS.filter((k) => count(k) > 0).map((k) => ({
      value: k,
      label: PRODUCT_CATEGORIES[k].label,
      count: count(k),
      color: PRODUCT_CATEGORIES[k].color,
    })),
  ]
  const none = count("none")
  return none > 0
    ? [
        ...options,
        {
          value: "none",
          label: "Chưa phân loại",
          count: none,
          color: UNCATEGORIZED_COLOR,
        },
      ]
    : options
}

type CategoryNavProps = {
  options: readonly CategoryNavOption[]
  value: CategoryFilter
  onChange: (value: CategoryFilter) => void
}

export function CategoryNav({ options, value, onChange }: CategoryNavProps) {
  return (
    <nav
      aria-label="Danh mục sản phẩm"
      className="flex gap-0.5 overflow-x-auto rounded-2xl border bg-card p-1.5 md:sticky md:top-[84px] md:flex-col md:p-2.5"
    >
      <div className="hidden px-2.5 pt-2 pb-1.5 text-[11px] font-bold tracking-[.07em] text-muted-foreground uppercase md:block">
        Danh mục
      </div>
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            style={
              isActive
                ? { color: opt.color[0], background: opt.color[1] }
                : undefined
            }
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13.5px] leading-snug font-medium whitespace-nowrap text-secondary-foreground hover:bg-muted md:items-start md:whitespace-normal",
              isActive && "font-bold"
            )}
          >
            <i
              aria-hidden="true"
              className="size-[9px] shrink-0 rounded-full md:mt-[5px]"
              style={{ background: opt.color[0] }}
            />
            <span className="min-w-0 flex-1">{opt.label}</span>
            <em
              className={cn(
                "rounded-full bg-muted px-2 text-xs font-semibold text-muted-foreground not-italic tabular-nums",
                isActive && "bg-white"
              )}
            >
              {opt.count}
            </em>
          </button>
        )
      })}
    </nav>
  )
}
