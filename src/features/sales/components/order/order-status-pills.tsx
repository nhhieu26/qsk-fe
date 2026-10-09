import { StatusPill } from "@/components/common/status-pill"
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/features/sales/constants"
import type { Order } from "@/features/sales/types"

export function OrderStatusPills({
  order,
}: {
  order: Pick<Order, "status" | "paymentStatus">
}) {
  const status = ORDER_STATUSES[order.status]
  const payment = PAYMENT_STATUSES[order.paymentStatus]
  return (
    <div className="flex flex-wrap gap-1.5">
      <StatusPill tone={status.tone}>{status.label}</StatusPill>
      <StatusPill tone={payment.tone}>{payment.label}</StatusPill>
    </div>
  )
}
