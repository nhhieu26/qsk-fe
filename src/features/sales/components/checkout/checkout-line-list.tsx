import { QuantityStepper } from "@/components/common/quantity-stepper"
import type { Product } from "@/features/products/types"
import { ProductThumb } from "@/features/sales/components/product-thumb"
import type { CartLine } from "@/features/sales/types"
import { formatVnd } from "@/lib/format"

type CheckoutLineListProps = {
  lines: readonly CartLine[]
  products: readonly Product[]
  onQuantityChange: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

/** Danh sách dòng hàng gọn cho cột tóm tắt bên phải. */
export function CheckoutLineList({
  lines,
  products,
  onQuantityChange,
  onRemove,
}: CheckoutLineListProps) {
  return (
    <ul className="max-h-[360px] divide-y overflow-y-auto">
      {lines.map((line) => {
        const product = products.find((p) => p.id === line.productId)
        return (
          <li
            key={line.productId}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 gap-y-2 py-3"
          >
            <ProductThumb name={line.name} category={product?.category} />
            <div className="min-w-0">
              <div className="text-[13.5px] leading-snug font-semibold">
                {line.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatVnd(line.price)}
              </div>
            </div>
            <div className="text-right text-sm font-bold tabular-nums">
              {formatVnd(line.price * line.quantity)}
            </div>
            <div className="col-start-2 flex items-center gap-3">
              <QuantityStepper
                value={line.quantity}
                min={1}
                max={product?.stock ?? line.quantity}
                onChange={(q) => onQuantityChange(line.productId, q)}
              />
              <button
                type="button"
                onClick={() => onRemove(line.productId)}
                className="text-xs text-muted-foreground hover:text-danger"
              >
                Xoá
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
