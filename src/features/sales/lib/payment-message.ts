import { formatAddress } from "@/features/customers/lib/customer-validation"
import { SHIPPING_METHODS } from "@/features/sales/constants"
import type { Order, PaymentInfo } from "@/features/sales/types"
import { formatVnd } from "@/lib/format"

/** Tin nhắn gửi khách qua Zalo/SMS: tóm tắt đơn + thông tin chuyển khoản. */
export function buildPaymentMessage(
  order: Order,
  payment: PaymentInfo
): string {
  const items = order.lines.map(
    (l) => `- ${l.name} x${l.quantity}: ${formatVnd(l.price * l.quantity)}`
  )
  const recipient = order.shipping.recipient
  const delivery = recipient
    ? `Giao: ${SHIPPING_METHODS[order.shipping.method].label} tới ${recipient.name} (${recipient.phone}), ${formatAddress(recipient.address)}`
    : `Nhận hàng: ${SHIPPING_METHODS[order.shipping.method].label}`

  return [
    `Quầy Sức Khỏe xác nhận đơn ${order.code}`,
    ...items,
    order.totals.shippingFee > 0
      ? `Phí vận chuyển: ${formatVnd(order.totals.shippingFee)}`
      : undefined,
    order.totals.pointsDiscount > 0
      ? `Dùng điểm Mi: -${formatVnd(order.totals.pointsDiscount)}`
      : undefined,
    `Tổng thanh toán: ${formatVnd(payment.amount)}`,
    delivery,
    "",
    "Thông tin chuyển khoản:",
    `Ngân hàng: ${payment.bankName}`,
    `Số tài khoản: ${payment.accountNumber}`,
    `Chủ tài khoản: ${payment.accountName}`,
    `Số tiền: ${formatVnd(payment.amount)}`,
    `Nội dung: ${payment.transferContent}`,
    payment.paymentUrl ? `Thanh toán online: ${payment.paymentUrl}` : undefined,
  ]
    .filter((line) => line !== undefined)
    .join("\n")
}
