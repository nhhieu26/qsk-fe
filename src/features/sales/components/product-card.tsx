import { ShoppingCart, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CategoryTag } from "@/features/products/components/category-tag"
import {
  categoryColor,
  getMissingDocuments,
} from "@/features/products/lib/product-compliance"
import type { Product } from "@/features/products/types"
import { ProductThumb } from "@/features/sales/components/product-thumb"
import { formatVnd } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Tồn từ mức này trở xuống thì hiện nhãn "Còn n". */
const LOW_STOCK_BADGE = 3

type ProductCardProps = {
  product: Product
  inCart: number
  /** Không truyền = không có quyền bán (ẩn nút). */
  onAddToCart?: () => void
  onBuyNow?: () => void
}

export function ProductCard({
  product: p,
  inCart,
  onAddToCart,
  onBuyNow,
}: ProductCardProps) {
  const isOut = p.stock <= 0
  const isLow = !isOut && p.stock <= Math.max(p.threshold, LOW_STOCK_BADGE)
  const hasMissingDocs = getMissingDocuments(p).length > 0
  const canAddMore = !isOut && inCart < p.stock

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(16,24,40,.25)]",
        isOut && "opacity-60 hover:translate-y-0 hover:shadow-none"
      )}
    >
      <div
        className="grid aspect-[1/0.7] place-items-center"
        style={{ background: categoryColor(p.category)[1] }}
      >
        <ProductThumb
          name={p.name}
          category={p.category}
          size="lg"
          className="bg-white/75 shadow-[0_8px_20px_-10px_rgba(16,24,40,.25)]"
        />
      </div>
      {(isOut || isLow) && (
        <span
          className={cn(
            "absolute top-3 left-3 rounded-md px-2 py-0.5 text-[11.5px] font-bold text-white",
            isOut ? "bg-[#C2362F]" : "bg-[#D97706]"
          )}
        >
          {isOut ? "Hết hàng" : `Còn ${p.stock}`}
        </span>
      )}
      {inCart > 0 && (
        <span className="absolute top-3 right-3 rounded-full bg-primary px-2 py-0.5 text-[11.5px] font-bold text-white">
          Trong giỏ: {inCart}
        </span>
      )}
      <div className="flex flex-1 flex-col gap-1.5 px-4 pt-3.5 pb-4">
        <CategoryTag category={p.category} />
        <h3 className="line-clamp-2 min-h-[2.8em] text-[14.5px] leading-snug font-bold">
          {p.name}
        </h3>
        {hasMissingDocs && (
          <p className="text-xs font-semibold text-danger">Thiếu giấy tờ</p>
        )}
        <div className="text-lg font-bold text-primary tabular-nums">
          {formatVnd(p.price)}
        </div>
        <div className="text-xs text-muted-foreground">Tồn kho: {p.stock}</div>
        {(onAddToCart || onBuyNow) && (
          <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              size="lg"
              className="px-2"
              disabled={!canAddMore}
              onClick={onAddToCart}
            >
              <ShoppingCart data-icon="inline-start" /> Thêm giỏ
            </Button>
            <Button
              size="lg"
              className="px-2"
              disabled={isOut}
              onClick={onBuyNow}
            >
              <Zap data-icon="inline-start" /> Mua ngay
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}
