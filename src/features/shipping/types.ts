import type { Address } from "@/features/customers/types"
import type { PaymentMethod, ShippingMethod } from "@/features/sales/types"

/** Tỉnh/thành hoặc phường/xã theo danh mục ViettelPost (2 cấp, từ 01/07/2025). */
export type AreaOption = {
  id: number
  name: string
}

export type ShippingQuoteInput = {
  method: ShippingMethod
  /** Bắt buộc khi giao hàng (viettel, express). */
  address?: Pick<Address, "province" | "ward" | "street">
  lines: readonly { productId: string; quantity: number }[]
  /** COD làm ViettelPost cộng phí thu hộ. Mặc định "cash". */
  paymentMethod?: PaymentMethod
}

export type ShippingQuote = {
  method: ShippingMethod
  /** Phí khách trả: truyền vào `calculateTotals({ shippingFee })`. */
  fee: number
  /** Cước ViettelPost báo (không có khi miễn phí hoặc không phải Viettel). */
  carrierFee?: number
  /** Đơn đủ mức miễn phí ship (quầy chịu cước). */
  freeShipping: boolean
  /** Tổng cân nặng gram đã dùng để báo phí. */
  weight: number
}
