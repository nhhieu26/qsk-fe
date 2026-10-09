import type { StatusTone } from "@/components/common/status-pill"
import type { Product } from "@/features/products/types"
import { NEAR_THRESHOLD_RATIO } from "@/features/stock/constants"

export type StockStatus = { label: string; tone: StatusTone }

export function getStockStatus(product: Product): StockStatus {
  const { stock, threshold } = product
  if (stock <= 0) return { label: "Hết hàng", tone: "danger" }
  if (stock <= threshold) return { label: "Dưới ngưỡng", tone: "warning" }
  if (stock <= threshold * NEAR_THRESHOLD_RATIO)
    return { label: "Gần ngưỡng", tone: "warning" }
  return { label: "Đủ hàng", tone: "success" }
}

export function loanedQuantity(product: Product): number {
  return product.loans.reduce((sum, loan) => sum + loan.quantity, 0)
}

/** Giá trị tồn: theo giá nhập, chưa có thì theo giá bán. */
export function stockValue(products: readonly Product[]): number {
  return products.reduce(
    (sum, p) => sum + p.stock * (p.costPrice || p.price),
    0
  )
}
