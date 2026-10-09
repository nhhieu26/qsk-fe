import { FilterChips, type ChipOption } from "@/components/common/filter-chips"
import { SearchInput } from "@/components/common/search-input"
import {
  PRODUCT_CATEGORIES,
  UNCATEGORIZED_COLOR,
} from "@/features/products/constants"
import { CATEGORY_KEYS } from "@/features/products/lib/product-compliance"
import {
  matchesCategory,
  matchesCompliance,
  type CategoryFilter,
  type ComplianceFilter,
  type ProductFilterState,
} from "@/features/products/lib/product-filters"
import type { Product } from "@/features/products/types"

type ProductFiltersProps = {
  products: readonly Product[]
  value: ProductFilterState
  onChange: (value: ProductFilterState) => void
}

const COMPLIANCE_OPTIONS: readonly {
  value: ComplianceFilter
  label: string
  color?: readonly [string, string]
}[] = [
  { value: "all", label: "Tất cả" },
  { value: "complete", label: "Đủ giấy tờ", color: ["#2F7A36", "#EAF6EC"] },
  { value: "missing", label: "Thiếu giấy tờ", color: ["#B3382F", "#FCEEED"] },
  {
    value: "lowStock",
    label: "Dưới ngưỡng tồn",
    color: ["#A65A0A", "#FFF3E3"],
  },
]

function categoryOptions(
  products: readonly Product[]
): ChipOption<CategoryFilter>[] {
  const count = (f: CategoryFilter) =>
    products.filter((p) => matchesCategory(p, f)).length
  const present = CATEGORY_KEYS.filter((k) =>
    products.some((p) => p.category === k)
  )
  const options: ChipOption<CategoryFilter>[] = [
    { value: "all", label: "Tất cả", count: products.length },
    ...present.map((k) => ({
      value: k,
      label: PRODUCT_CATEGORIES[k].label,
      count: count(k),
      color: PRODUCT_CATEGORIES[k].color,
    })),
  ]
  const uncategorized = count("none")
  return uncategorized > 0
    ? [
        ...options,
        {
          value: "none",
          label: "Chưa phân loại",
          count: uncategorized,
          color: UNCATEGORIZED_COLOR,
        },
      ]
    : options
}

export function ProductFilters({
  products,
  value,
  onChange,
}: ProductFiltersProps) {
  const complianceOptions = COMPLIANCE_OPTIONS.map((o) => ({
    ...o,
    count: products.filter((p) => matchesCompliance(p, o.value)).length,
  }))

  return (
    <div className="mb-5 grid gap-3 rounded-[14px] border bg-card px-5 py-4">
      <SearchInput
        value={value.query}
        onChange={(query) => onChange({ ...value, query })}
        placeholder="Tìm theo tên sản phẩm, số công bố hoặc nhóm khách"
        className="h-10 w-full max-w-[460px]"
      />
      <FilterRow label="Loại hàng">
        <FilterChips
          options={categoryOptions(products)}
          value={value.category}
          onChange={(category) => onChange({ ...value, category })}
        />
      </FilterRow>
      <FilterRow label="Tình trạng">
        <FilterChips
          options={complianceOptions}
          value={value.compliance}
          onChange={(compliance) => onChange({ ...value, compliance })}
        />
      </FilterRow>
    </div>
  )
}

function FilterRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5 border-t pt-3 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-3">
      <div className="pt-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:pt-2">
        {label}
      </div>
      {children}
    </div>
  )
}
