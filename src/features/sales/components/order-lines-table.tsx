import { X } from "lucide-react"

import { QuantityStepper } from "@/components/common/quantity-stepper"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { categoryLabel } from "@/features/products/lib/product-compliance"
import type { Product } from "@/features/products/types"
import { ProductThumb } from "@/features/sales/components/product-thumb"
import type { CartLine } from "@/features/sales/types"
import { formatVnd } from "@/lib/format"

type OrderLinesTableProps = {
  lines: readonly CartLine[]
  /** Dùng để giới hạn số lượng theo tồn và hiện loại hàng. */
  products: readonly Product[]
  /** Không truyền = chỉ xem. */
  onQuantityChange?: (productId: string, quantity: number) => void
  onRemove?: (productId: string) => void
}

export function OrderLinesTable({
  lines,
  products,
  onQuantityChange,
  onRemove,
}: OrderLinesTableProps) {
  const isEditable = onQuantityChange !== undefined

  return (
    <Table className="text-[13.5px]">
      <TableHeader>
        <TableRow className="bg-surface-2 hover:bg-surface-2">
          <TableHead className="pl-4">Sản phẩm</TableHead>
          <TableHead className="text-right">Đơn giá</TableHead>
          <TableHead className="text-center">Số lượng</TableHead>
          <TableHead className="text-right">Thành tiền</TableHead>
          {onRemove && <TableHead className="w-10 pr-4" aria-label="Xoá" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line) => {
          const product = products.find((p) => p.id === line.productId)
          return (
            <TableRow key={line.productId}>
              <TableCell className="py-3 pl-4 whitespace-normal">
                <div className="flex items-center gap-3">
                  <ProductThumb name={line.name} category={product?.category} />
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">
                      {line.name}
                    </div>
                    {product && (
                      <div className="text-xs text-muted-foreground">
                        {categoryLabel(product.category)} · tồn {product.stock}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatVnd(line.price)}
              </TableCell>
              <TableCell className="text-center">
                {isEditable ? (
                  <QuantityStepper
                    value={line.quantity}
                    min={1}
                    max={product?.stock ?? line.quantity}
                    onChange={(q) => onQuantityChange(line.productId, q)}
                  />
                ) : (
                  line.quantity
                )}
              </TableCell>
              <TableCell className="text-right font-bold text-foreground">
                {formatVnd(line.price * line.quantity)}
              </TableCell>
              {onRemove && (
                <TableCell className="pr-4">
                  <button
                    type="button"
                    aria-label={`Xoá ${line.name}`}
                    onClick={() => onRemove(line.productId)}
                    className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-danger-soft hover:text-danger"
                  >
                    <X className="size-4" />
                  </button>
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
