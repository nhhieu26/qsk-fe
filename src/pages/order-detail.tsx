import { Link, useParams } from "react-router"

import { PageError, PageLoading } from "@/components/common/query-state"
import { useProducts } from "@/features/products/hooks/use-products"
import { OrderActions } from "@/features/sales/components/order/order-actions"
import { OrderInfoPanel } from "@/features/sales/components/order/order-info-cards"
import { OrderStatusPills } from "@/features/sales/components/order/order-status-pills"
import { PaymentPanel } from "@/features/sales/components/order/payment-panel"
import { OrderLinesTable } from "@/features/sales/components/order-lines-table"
import { OrderTotalsSummary } from "@/features/sales/components/order-totals-summary"
import { useOrder } from "@/features/sales/hooks/use-orders"
import { needsPaymentRequest } from "@/features/sales/lib/order-workflow"
import { formatDate, formatTime } from "@/lib/format"

export function OrderDetailPage() {
  const { orderId = "" } = useParams()
  const { data: order, isPending, error, refetch } = useOrder(orderId)
  const products = useProducts()

  if (isPending) return <PageLoading />
  if (error) return <PageError error={error} onRetry={() => void refetch()} />

  return (
    <>
      <header className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="min-w-0 flex-[1_1_320px]">
          <Link
            to="/orders"
            className="text-xs font-medium text-muted-foreground hover:text-primary print:hidden"
          >
            ‹ Đơn hàng
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight">
              Đơn {order.code}
            </h1>
            <OrderStatusPills order={order} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatTime(order.createdAt)} {formatDate(order.createdAt)} ·{" "}
            {order.createdBy}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <OrderActions order={order} />
        </div>
      </header>

      {order.status === "cancelled" && (
        <p
          role="alert"
          className="mb-4 rounded-[10px] bg-danger-soft px-4 py-2.5 text-[13px] text-danger"
        >
          <b>Đã huỷ.</b> Lý do: {order.cancelReason}
        </p>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-4">
          {needsPaymentRequest(order) && <PaymentPanel order={order} />}
          <section className="overflow-hidden rounded-[14px] border bg-card shadow-xs">
            <h2 className="border-b px-4 py-2.5 text-sm font-semibold">
              Sản phẩm · {order.lines.length}
            </h2>
            <OrderLinesTable
              lines={order.lines}
              products={products.data ?? []}
            />
            <div className="border-t px-4 py-3">
              <div className="ml-auto max-w-xs">
                <OrderTotalsSummary
                  totals={order.totals}
                  showEarnedPoints={order.status !== "cancelled"}
                  compact
                />
              </div>
            </div>
          </section>
        </div>
        <OrderInfoPanel order={order} />
      </div>
    </>
  )
}
