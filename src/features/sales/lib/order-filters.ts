import { ORDER_STATUSES } from "@/features/sales/constants"
import type {
  Order,
  OrderListQuery,
  OrderPage,
  OrderStatus,
  OrderStatusCounts,
} from "@/features/sales/types"
import { normalizeSearch, toIsoDate } from "@/lib/format"

export const ORDER_STATUS_KEYS = Object.keys(ORDER_STATUSES) as OrderStatus[]

/** Mọi điều kiện lọc trừ trạng thái (để đếm số đơn mỗi tab). */
function matchesBase(order: Order, query: OrderListQuery): boolean {
  const q = normalizeSearch(query.q)
  const day = toIsoDate(new Date(order.createdAt))
  const haystack = normalizeSearch(
    `${order.code} ${order.customer.name} ${order.customer.phone}`
  )
  return (
    (!query.paymentStatus || order.paymentStatus === query.paymentStatus) &&
    (!query.paymentMethod || order.paymentMethod === query.paymentMethod) &&
    (!query.shippingMethod || order.shipping.method === query.shippingMethod) &&
    (!q || haystack.includes(q)) &&
    (!query.from || day >= query.from) &&
    (!query.to || day <= query.to)
  )
}

function countByStatus(orders: readonly Order[]): OrderStatusCounts {
  const zero = Object.fromEntries(
    ORDER_STATUS_KEYS.map((s) => [s, 0])
  ) as Record<OrderStatus, number>
  const byStatus = orders.reduce(
    (acc, o) => ({ ...acc, [o.status]: acc[o.status] + 1 }),
    zero
  )
  return { ...byStatus, all: orders.length }
}

/**
 * Lọc + phân trang + đếm theo trạng thái, cùng ngữ nghĩa với `GET /orders`
 * ở backend. Dùng cho chế độ mock.
 */
export function queryOrders(
  orders: readonly Order[],
  query: OrderListQuery
): OrderPage {
  const base = orders.filter((o) => matchesBase(o, query))
  const rows = base
    .filter((o) => !query.status || o.status === query.status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const totalPages = Math.max(1, Math.ceil(rows.length / query.limit))
  const start = (query.page - 1) * query.limit

  return {
    orders: rows.slice(start, start + query.limit),
    pagination: {
      page: query.page,
      limit: query.limit,
      total: rows.length,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1,
    },
    counts: countByStatus(base),
  }
}
