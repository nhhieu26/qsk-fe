import { Link, useSearchParams } from "react-router"
import { Plus } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { Pagination } from "@/components/common/pagination"
import { PageError } from "@/components/common/query-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Can } from "@/features/access/can"
import { PERMISSIONS } from "@/features/access/permissions"
import { usePermissions } from "@/features/access/use-permissions"
import { OrderFilterBar } from "@/features/sales/components/order/order-filter-bar"
import { OrderStatusTabs } from "@/features/sales/components/order/order-status-tabs"
import { OrdersTable } from "@/features/sales/components/order/orders-table"
import { ORDER_PAGE_SIZE } from "@/features/sales/constants"
import { useOrders } from "@/features/sales/hooks/use-orders"
import {
  hasActiveFilters,
  parseOrderListParams,
  toOrderSearchParams,
  type OrderListParams,
} from "@/features/sales/lib/order-list-params"
import { useDebouncedValue } from "@/lib/use-debounced-value"

const SEARCH_DEBOUNCE_MS = 300

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = parseOrderListParams(searchParams)
  const q = useDebouncedValue(params.q, SEARCH_DEBOUNCE_MS)
  const { data, isPending, isFetching, error, refetch } = useOrders({
    ...params,
    q,
    limit: ORDER_PAGE_SIZE,
  })
  const { can } = usePermissions()

  const update = (patch: Partial<OrderListParams>) =>
    setSearchParams(toOrderSearchParams(params, patch), { replace: true })

  return (
    <>
      <PageHeader
        breadcrumb="Bán hàng / Đơn hàng"
        title="Đơn hàng"
        description="Theo dõi duyệt đơn, giao hàng và thanh toán của từng đơn"
        actions={
          <Can permission={PERMISSIONS.salesCreate}>
            <Button size="lg" asChild>
              <Link to="/sales">
                <Plus data-icon="inline-start" /> Tạo đơn
              </Link>
            </Button>
          </Can>
        }
      />
      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <OrderStatusTabs
          value={params.status}
          counts={data?.counts}
          onChange={(status) => update({ status })}
        />
        <OrderFilterBar params={params} onChange={update} />
        {error ? (
          <div className="border-t p-4">
            <PageError error={error} onRetry={() => void refetch()} />
          </div>
        ) : isPending ? (
          <div
            className="grid gap-2 border-t p-4"
            aria-busy="true"
            aria-label="Đang tải đơn hàng"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data.orders.length === 0 ? (
          <div className="border-t">
            <EmptyState
              title={
                hasActiveFilters(params) || params.status
                  ? "Không có đơn nào khớp"
                  : "Chưa có đơn hàng nào"
              }
              description={
                hasActiveFilters(params)
                  ? "Đổi từ khoá hoặc bỏ bớt bộ lọc."
                  : "Vào Bán hàng để tạo đơn đầu tiên."
              }
            />
          </div>
        ) : (
          <div
            className={isFetching ? "opacity-60 transition-opacity" : undefined}
          >
            <OrdersTable
              orders={data.orders}
              canEditNote={can(PERMISSIONS.ordersUpdate)}
            />
            <Pagination
              total={data.pagination.total}
              slice={{
                page: data.pagination.page,
                pageCount: data.pagination.totalPages,
                from: (data.pagination.page - 1) * data.pagination.limit,
                to: Math.min(
                  data.pagination.total,
                  data.pagination.page * data.pagination.limit
                ),
              }}
              unitLabel="đơn"
              onPageChange={(page) => update({ page })}
            />
          </div>
        )}
      </section>
    </>
  )
}
