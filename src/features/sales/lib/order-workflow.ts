import type { Order, OrderStatus } from "@/features/sales/types"

/**
 * Các bước tiếp theo hợp lệ của một đơn. Backend (`order.rules.ts`) kiểm tra
 * lại cùng quy tắc, sửa ở đây thì phải sửa cả bên đó.
 */
export type OrderActions = {
  canMarkPaid: boolean
  canApprove: boolean
  /** Bàn giao đơn vị vận chuyển (có mã vận đơn) → chờ lấy hàng. */
  canHandOver: boolean
  /** Đơn vị vận chuyển đã lấy hàng → đang giao. */
  canMarkShipping: boolean
  /** Hàng đã sẵn sàng, báo khách đến quầy nhận. */
  canMarkReady: boolean
  canComplete: boolean
  canCancel: boolean
}

const CANCELLABLE: readonly OrderStatus[] = [
  "new",
  "approved",
  "awaitingPickup",
  "readyForPickup",
]

export function availableActions(order: Order): OrderActions {
  const isOpen = order.status !== "completed" && order.status !== "cancelled"
  const isDelivery = order.shipping.method !== "pickup"
  const isPaid = order.paymentStatus === "paid"
  // Duyệt khi tiền đã chắc chắn: đã trả, thu hộ, hoặc khách trả tiền mặt lúc nhận tại quầy.
  const isPaymentSecured =
    isPaid ||
    order.paymentMethod === "cod" ||
    (!isDelivery && order.paymentMethod === "cash")

  return {
    canMarkPaid: isOpen && order.paymentStatus === "unpaid",
    canApprove: order.status === "new" && isPaymentSecured,
    canHandOver: isDelivery && order.status === "approved",
    canMarkShipping: isDelivery && order.status === "awaitingPickup",
    canMarkReady: !isDelivery && order.status === "approved",
    canComplete: isDelivery
      ? order.status === "shipping"
      : order.status === "readyForPickup" && isPaid,
    canCancel: CANCELLABLE.includes(order.status),
  }
}

/** Đơn cần gửi thông tin thanh toán cho khách: chưa trả và không phải COD. */
export function needsPaymentRequest(order: Order): boolean {
  return (
    order.status !== "cancelled" &&
    order.paymentStatus === "unpaid" &&
    order.paymentMethod === "transfer"
  )
}
