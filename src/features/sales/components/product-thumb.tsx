import { categoryColor } from "@/features/products/lib/product-compliance"
import type { ProductCategory } from "@/features/products/types"
import { cn } from "@/lib/utils"

/** Hai chữ cái đầu của tên sản phẩm, thay ảnh khi chưa có ảnh thật. */
function productInitials(name: string): string {
  const [first = "?", second = ""] = name.trim().split(/\s+/)
  return (first.charAt(0) + second.charAt(0)).toUpperCase()
}

type ProductThumbProps = {
  name: string
  category: ProductCategory | undefined
  size?: "sm" | "lg"
  className?: string
}

export function ProductThumb({
  name,
  category,
  size = "sm",
  className,
}: ProductThumbProps) {
  const [color, background] = categoryColor(category)
  return (
    <span
      aria-hidden="true"
      style={{ color, background }}
      className={cn(
        "grid shrink-0 place-items-center font-bold",
        size === "sm"
          ? "size-10 rounded-[10px] text-[13px]"
          : "size-[86px] rounded-[22px] text-[28px]",
        className
      )}
    >
      {productInitials(name)}
    </span>
  )
}
