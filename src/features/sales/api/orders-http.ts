import { http, type ApiResponse } from "@/api/http"
import type { OrdersRepository } from "@/features/sales/api/orders-repository"
import type { Order, OrderPage, PaymentInfo } from "@/features/sales/types"

type OrderBody = ApiResponse<{ order: Order }>

const orderPath = (id: string) => `/orders/${encodeURIComponent(id)}`

/** POST một bước chuyển trạng thái, trả đơn sau khi đổi. */
async function postAction(
  id: string,
  action: string,
  body?: object
): Promise<Order> {
  const res = await http.post<OrderBody>(`${orderPath(id)}/${action}`, body)
  return res.data.data.order
}

/**
 * Hợp đồng backend: docs/api-sales-orders.md.
 * - GET   /orders?status=&paymentStatus=&paymentMethod=&shippingMethod=&q=&from=&to=&page=&limit=
 *         → { orders, pagination, counts }
 * - GET   /orders/:id                → { order }
 * - POST  /orders                    → { order }  (409 nếu expectedTotal lệch)
 * - GET   /orders/:id/payment        → { payment }
 * - POST  /orders/:id/mark-paid | approve | mark-shipping | mark-ready | complete
 * - POST  /orders/:id/hand-over      body: { trackingCode }
 * - POST  /orders/:id/cancel         body: { reason }
 * - PATCH /orders/:id/note           body: { note }
 */
export const ordersHttp: OrdersRepository = {
  async list(query) {
    const res = await http.get<ApiResponse<OrderPage>>("/orders", {
      // Bỏ trường rỗng để URL gọn và không bị backend coi là giá trị lọc.
      params: Object.fromEntries(
        Object.entries(query).filter(([, v]) => v !== undefined && v !== "")
      ),
    })
    return res.data.data
  },

  async get(id) {
    const res = await http.get<OrderBody>(orderPath(id))
    return res.data.data.order
  },

  async create(input) {
    const res = await http.post<OrderBody>("/orders", input)
    return res.data.data.order
  },

  async getPaymentInfo(id) {
    const res = await http.get<ApiResponse<{ payment: PaymentInfo }>>(
      `${orderPath(id)}/payment`
    )
    return res.data.data.payment
  },

  markPaid: (id) => postAction(id, "mark-paid"),
  approve: (id) => postAction(id, "approve"),
  handOver: (id, input) => postAction(id, "hand-over", input),
  markShipping: (id) => postAction(id, "mark-shipping"),
  markReady: (id) => postAction(id, "mark-ready"),
  complete: (id) => postAction(id, "complete"),
  cancel: (id, input) => postAction(id, "cancel", input),

  async updateNote(id, note) {
    const res = await http.patch<OrderBody>(`${orderPath(id)}/note`, { note })
    return res.data.data.order
  },
}
