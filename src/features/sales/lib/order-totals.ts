import {
  POINT_EARN_RATE,
  SHIPPING_METHODS,
  STORE_PROVINCE,
} from "@/features/sales/constants"
import type {
  CartLine,
  OrderTotals,
  ShippingMethod,
} from "@/features/sales/types"
import { normalizeSearch } from "@/lib/format"

export function subtotalOf(
  lines: readonly Pick<CartLine, "price" | "quantity">[]
): number {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
}

export function shippingFee(method: ShippingMethod, subtotal: number): number {
  const def: { baseFee: number; freeFrom?: number } = SHIPPING_METHODS[method]
  if (def.freeFrom !== undefined && subtotal >= def.freeFrom) return 0
  return def.baseFee
}

const PROVINCE_PREFIX = /^(thanh pho|tinh|tp\.?)\s+/

/** "Hà Nội" = "Thành phố Hà Nội" (danh mục ViettelPost có tiền tố), giống backend. */
export function isSameProvince(a: string, b: string): boolean {
  const key = (v: string) => normalizeSearch(v).replace(PROVINCE_PREFIX, "")
  return key(a) !== "" && key(a) === key(b)
}

/** Phương thức giao có dùng được cho tỉnh nhận hay không (hoả tốc chỉ nội tỉnh quầy). */
export function isShippingAvailable(
  method: ShippingMethod,
  province: string
): boolean {
  return (
    !SHIPPING_METHODS[method].sameProvinceOnly ||
    province === "" ||
    isSameProvince(province, STORE_PROVINCE)
  )
}

/** Điểm dùng tối đa: không quá số điểm đang có, không quá tiền hàng (không trừ vào phí ship). */
export function maxUsablePoints(
  availablePoints: number,
  subtotal: number
): number {
  return Math.max(0, Math.min(availablePoints, subtotal))
}

export function calculateTotals(params: {
  lines: readonly Pick<CartLine, "price" | "quantity">[]
  shippingMethod: ShippingMethod
  pointsUsed: number
  availablePoints: number
  /**
   * Phí ship đã báo từ `POST /shipping/quote` (`quote.fee`). Viettel Post tính
   * phí thật theo địa chỉ + cân nặng nên PHẢI truyền vào, nếu không
   * `expectedTotal` lệch và backend trả 409. Bỏ trống thì dùng bảng phí dự kiến.
   */
  shippingFee?: number
}): OrderTotals {
  const subtotal = subtotalOf(params.lines)
  const fee = params.shippingFee ?? shippingFee(params.shippingMethod, subtotal)
  const pointsDiscount = Math.min(
    Math.max(0, Math.round(params.pointsUsed)),
    maxUsablePoints(params.availablePoints, subtotal)
  )
  const goodsPaid = subtotal - pointsDiscount
  return {
    subtotal,
    shippingFee: fee,
    pointsDiscount,
    total: goodsPaid + fee,
    earnedPoints: Math.round(goodsPaid * POINT_EARN_RATE),
  }
}
