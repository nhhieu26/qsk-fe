import type { Address, InvoiceInfo } from "@/features/customers/types"
import type {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SHIPPING_METHODS,
} from "@/features/sales/constants"

export type ShippingMethod = keyof typeof SHIPPING_METHODS
export type PaymentMethod = keyof typeof PAYMENT_METHODS
export type OrderStatus = keyof typeof ORDER_STATUSES
export type PaymentStatus = keyof typeof PAYMENT_STATUSES

/** Một dòng trong giỏ / trang đặt hàng (giá chỉ để hiển thị, backend tính lại). */
export type CartLine = {
  productId: string
  name: string
  price: number
  quantity: number
}

export type OrderTotals = {
  subtotal: number
  shippingFee: number
  pointsDiscount: number
  total: number
  /** Điểm Mi dự kiến tích sau đơn. */
  earnedPoints: number
}

export type OrderCustomer = {
  /** Có khi chọn khách đã lưu; khách mới thì backend tạo theo số điện thoại. */
  id?: string
  name: string
  phone: string
  email?: string
}

export type OrderRecipient = {
  name: string
  phone: string
  address: Address
}

export type OrderShipping = {
  method: ShippingMethod
  fee: number
  /** Không có khi lấy tại quầy. */
  recipient?: OrderRecipient
  /** Mã vận đơn của đơn vị vận chuyển. */
  trackingCode?: string
  note?: string
}

export type OrderLine = {
  productId: string
  name: string
  price: number
  quantity: number
}

export type Order = {
  id: string
  /** Mã đơn, cũng là nội dung chuyển khoản. */
  code: string
  createdAt: string
  createdBy: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  paidAt?: string
  customer: OrderCustomer
  shipping: OrderShipping
  invoice?: InvoiceInfo
  lines: readonly OrderLine[]
  pointsUsed: number
  totals: OrderTotals
  note?: string
  cancelReason?: string
}

export type CreateOrderInput = {
  lines: readonly { productId: string; quantity: number }[]
  customer: OrderCustomer
  shipping: {
    method: ShippingMethod
    recipient?: OrderRecipient
    note?: string
  }
  invoice?: InvoiceInfo
  payment: {
    method: PaymentMethod
    pointsUsed: number
    /** Đã thu tiền ngay tại quầy (tiền mặt / đã nhận chuyển khoản). */
    collectedNow: boolean
  }
  note?: string
  /** Tổng frontend tính, để backend phát hiện giá đã đổi. */
  expectedTotal: number
}

/** Thông tin thanh toán gửi ra ngoài cho khách (QR, tin nhắn, phiếu in). */
export type PaymentInfo = {
  orderCode: string
  amount: number
  bankBin: string
  bankName: string
  accountNumber: string
  accountName: string
  /** Nội dung chuyển khoản, để đối soát tự động. */
  transferContent: string
  /** Chuỗi VietQR (EMVCo); backend có thể trả sẵn, không có thì frontend tự dựng. */
  qrPayload?: string
  /** Link thanh toán online nếu backend tích hợp cổng thanh toán. */
  paymentUrl?: string
}

/** Bộ lọc màn Đơn hàng; gửi lên `GET /orders` dạng query string. */
export type OrderListQuery = {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod
  shippingMethod?: ShippingMethod
  /** Mã đơn, tên hoặc SĐT khách. */
  q?: string
  /** Ngày đặt `YYYY-MM-DD` (giờ VN), tính cả hai đầu. */
  from?: string
  to?: string
  page: number
  limit: number
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/** Số đơn mỗi trạng thái theo cùng bộ lọc (trừ trạng thái), để hiện trên tab. */
export type OrderStatusCounts = Record<OrderStatus | "all", number>

export type OrderPage = {
  orders: Order[]
  pagination: Pagination
  counts: OrderStatusCounts
}
