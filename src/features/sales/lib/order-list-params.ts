import { z } from "zod"

import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SHIPPING_METHODS,
} from "@/features/sales/constants"
import { ORDER_STATUS_KEYS } from "@/features/sales/lib/order-filters"
import type {
  OrderListQuery,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingMethod,
} from "@/features/sales/types"

const keysOf = <T extends string>(obj: Record<T, unknown>) =>
  Object.keys(obj) as [T, ...T[]]
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

/** Tham số URL sai (gõ tay, link cũ) thì bỏ qua thay vì báo lỗi. */
const paramsSchema = z.object({
  status: z
    .enum(ORDER_STATUS_KEYS as [OrderStatus, ...OrderStatus[]])
    .optional()
    .catch(undefined),
  paymentStatus: z
    .enum(keysOf<PaymentStatus>(PAYMENT_STATUSES))
    .optional()
    .catch(undefined),
  paymentMethod: z
    .enum(keysOf<PaymentMethod>(PAYMENT_METHODS))
    .optional()
    .catch(undefined),
  shippingMethod: z
    .enum(keysOf<ShippingMethod>(SHIPPING_METHODS))
    .optional()
    .catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  from: isoDate.optional().catch(undefined),
  to: isoDate.optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
})

export type OrderListParams = Omit<OrderListQuery, "limit">

export function parseOrderListParams(
  searchParams: URLSearchParams
): OrderListParams {
  const raw = Object.fromEntries(searchParams.entries())
  const parsed = paramsSchema.parse(raw)
  // Khoảng ngày ngược thì bỏ ngày kết thúc.
  return parsed.from && parsed.to && parsed.from > parsed.to
    ? { ...parsed, to: undefined }
    : parsed
}

/** Ghi bộ lọc mới ra URL; đổi bất kỳ bộ lọc nào thì về trang 1. */
export function toOrderSearchParams(
  current: OrderListParams,
  patch: Partial<OrderListParams>
): URLSearchParams {
  const next = { ...current, page: 1, ...patch }
  const entries = Object.entries(next).filter(
    ([key, value]) =>
      value !== undefined && value !== "" && !(key === "page" && value === 1)
  )
  return new URLSearchParams(entries.map(([k, v]) => [k, String(v)]))
}

export function hasActiveFilters(params: OrderListParams): boolean {
  return Boolean(
    params.q ||
    params.from ||
    params.to ||
    params.paymentStatus ||
    params.paymentMethod ||
    params.shippingMethod
  )
}
