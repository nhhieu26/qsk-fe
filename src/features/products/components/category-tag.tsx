import {
  categoryColor,
  categoryLabel,
} from "@/features/products/lib/product-compliance"
import type { ProductCategory } from "@/features/products/types"

export function CategoryTag({
  category,
}: {
  category: ProductCategory | undefined
}) {
  const [color, background] = categoryColor(category)
  return (
    <span
      className="inline-flex max-w-[150px] items-center rounded-lg px-2 py-0.5 text-[11.5px] leading-snug font-semibold"
      style={{ color, background }}
    >
      {categoryLabel(category)}
    </span>
  )
}
