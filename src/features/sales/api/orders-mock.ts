import { ApiError } from "@/api/http"
import type { Customer } from "@/features/customers/types"
import type { OrdersRepository } from "@/features/sales/api/orders-repository"
import { calculateTotals } from "@/features/sales/lib/order-totals"
import {
  availableActions,
  type OrderActions,
} from "@/features/sales/lib/order-workflow"
import { buildVietQrPayload } from "@/features/sales/lib/vietqr"
import { queryOrders } from "@/features/sales/lib/order-filters"
import type { CreateOrderInput, Order, OrderLine } from "@/features/sales/types"
import { toIsoDate } from "@/lib/format"
import { MOCK_ACTOR, mockStore, withLatency } from "@/mocks/mock-store"
import { SEED_PAYMENT_ACCOUNT } from "@/mocks/seed"

function nextOrderCode(): string {
  const day = toIsoDate(new Date()).slice(2).replaceAll("-", "")
  const todayCount = mockStore
    .listOrders()
    .filter((o) => o.code.startsWith(`DH${day}`)).length
  return `DH${day}${String(todayCount + 1).padStart(3, "0")}`
}

function priceLines(input: CreateOrderInput): OrderLine[] {
  if (input.lines.length === 0) throw new ApiError("Đơn chưa có sản phẩm", 400)
  return input.lines.map(({ productId, quantity }) => {
    const product = mockStore.getProduct(productId)
    if (quantity < 1)
      throw new ApiError(`Số lượng ${product.name} không hợp lệ`, 400)
    if (quantity > product.stock) {
      throw new ApiError(
        `${product.name} chỉ còn ${product.stock} trong kho`,
        400
      )
    }
    return { productId, name: product.name, price: product.price, quantity }
  })
}

function findCustomer(input: CreateOrderInput): Customer | undefined {
  return mockStore
    .listCustomers()
    .find((c) => c.id === input.customer.id || c.phone === input.customer.phone)
}

function adjustPoints(phone: string, delta: number): void {
  if (delta === 0) return
  mockStore.upsertCustomer(phone, (c) => {
    if (!c) throw new ApiError("Không tìm thấy khách", 404)
    return { ...c, points: Math.max(0, c.points + delta) }
  })
}

function saveCustomer(input: CreateOrderInput, pointsUsed: number): Customer {
  const address = input.shipping.recipient?.address
  return mockStore.upsertCustomer(input.customer.phone, (c) => ({
    id: c?.id ?? crypto.randomUUID(),
    name: input.customer.name,
    phone: input.customer.phone,
    email: input.customer.email ?? c?.email,
    memberCode: c?.memberCode,
    points: (c?.points ?? 0) - pointsUsed,
    addresses: address
      ? [
          address,
          ...(c?.addresses ?? []).filter((a) => a.street !== address.street),
        ]
      : (c?.addresses ?? []),
    lastInvoice: input.invoice ?? c?.lastInvoice,
  }))
}

function createOrder(input: CreateOrderInput): Order {
  const lines = priceLines(input)
  const existing = findCustomer(input)
  const totals = calculateTotals({
    lines,
    shippingMethod: input.shipping.method,
    pointsUsed: input.payment.pointsUsed,
    availablePoints: existing?.points ?? 0,
  })
  if (totals.total !== input.expectedTotal) {
    throw new ApiError(
      "Giá hoặc điểm đã thay đổi, kiểm tra lại đơn trước khi đặt",
      409
    )
  }

  const code = nextOrderCode()
  lines.forEach((l) =>
    mockStore.moveStock({
      productId: l.productId,
      type: "sale",
      delta: () => -l.quantity,
      reference: code,
      counterparty: input.customer.name,
    })
  )
  const customer = saveCustomer(input, totals.pointsDiscount)
  const isPaid = input.payment.collectedNow && input.payment.method === "cash"
  const isPickup = input.shipping.method === "pickup"

  const order: Order = {
    id: crypto.randomUUID(),
    code,
    createdAt: new Date().toISOString(),
    createdBy: MOCK_ACTOR,
    status: isPaid ? (isPickup ? "completed" : "approved") : "new",
    paymentStatus: isPaid ? "paid" : "unpaid",
    paymentMethod: input.payment.method,
    paidAt: isPaid ? new Date().toISOString() : undefined,
    customer: { ...input.customer, id: customer.id },
    shipping: { ...input.shipping, fee: totals.shippingFee },
    invoice: input.invoice,
    lines,
    pointsUsed: totals.pointsDiscount,
    totals,
    note: input.note,
  }
  if (order.status === "completed")
    adjustPoints(customer.phone, totals.earnedPoints)
  return mockStore.saveOrder(order)
}

function transition(
  id: string,
  guard: keyof OrderActions,
  message: string,
  update: (o: Order) => Order
): Order {
  const order = mockStore.getOrder(id)
  if (!availableActions(order)[guard]) throw new ApiError(message, 400)
  return mockStore.saveOrder(update(order))
}

/** Bước chuyển trạng thái đơn giản: chỉ đổi `status`. */
function moveTo(
  id: string,
  guard: keyof OrderActions,
  message: string,
  status: Order["status"]
) {
  return withLatency(() =>
    transition(id, guard, message, (o) => ({ ...o, status }))
  )
}

export const ordersMock: OrdersRepository = {
  list: (query) =>
    withLatency(() => queryOrders(mockStore.listOrders(), query)),

  get: (id) => withLatency(() => mockStore.getOrder(id)),

  create: (input) => withLatency(() => createOrder(input)),

  getPaymentInfo: (id) =>
    withLatency(() => {
      const order = mockStore.getOrder(id)
      const info = {
        ...SEED_PAYMENT_ACCOUNT,
        orderCode: order.code,
        amount: order.totals.total,
        transferContent: order.code,
      }
      return {
        ...info,
        qrPayload: buildVietQrPayload({
          bankBin: info.bankBin,
          accountNumber: info.accountNumber,
          amount: info.amount,
          content: info.transferContent,
        }),
      }
    }),

  markPaid: (id) =>
    withLatency(() =>
      transition(
        id,
        "canMarkPaid",
        "Đơn này không cần xác nhận thanh toán",
        (o) => ({
          ...o,
          paymentStatus: "paid",
          paidAt: new Date().toISOString(),
        })
      )
    ),

  approve: (id) =>
    moveTo(
      id,
      "canApprove",
      "Chưa duyệt được: đơn chuyển khoản cần xác nhận đã nhận tiền trước",
      "approved"
    ),

  handOver: (id, { trackingCode }) =>
    withLatency(() => {
      if (trackingCode.trim() === "") throw new ApiError("Nhập mã vận đơn", 400)
      return transition(
        id,
        "canHandOver",
        "Chỉ bàn giao được đơn giao hàng đã duyệt",
        (o) => ({
          ...o,
          status: "awaitingPickup",
          shipping: { ...o.shipping, trackingCode: trackingCode.trim() },
        })
      )
    }),

  markShipping: (id) =>
    moveTo(
      id,
      "canMarkShipping",
      "Đơn chưa bàn giao cho đơn vị vận chuyển",
      "shipping"
    ),

  markReady: (id) =>
    moveTo(
      id,
      "canMarkReady",
      "Chỉ đơn nhận tại quầy đã duyệt mới báo khách đến lấy",
      "readyForPickup"
    ),

  updateNote: (id, note) =>
    withLatency(() => {
      const trimmed = note.trim()
      return mockStore.saveOrder({
        ...mockStore.getOrder(id),
        note: trimmed === "" ? undefined : trimmed,
      })
    }),

  complete: (id) =>
    withLatency(() => {
      const done = transition(
        id,
        "canComplete",
        "Đơn chưa thể hoàn tất: tại quầy cần thu tiền trước",
        (o) => ({
          ...o,
          status: "completed",
          paymentStatus: "paid",
          paidAt: o.paidAt ?? new Date().toISOString(),
        })
      )
      adjustPoints(done.customer.phone, done.totals.earnedPoints)
      return done
    }),

  cancel: (id, { reason }) =>
    withLatency(() => {
      if (reason.trim() === "") throw new ApiError("Ghi lý do huỷ đơn", 400)
      const cancelled = transition(
        id,
        "canCancel",
        "Hàng đã rời quầy hoặc đơn đã xong, không huỷ được",
        (o) => ({
          ...o,
          status: "cancelled",
          paymentStatus:
            o.paymentStatus === "paid" ? "refunded" : o.paymentStatus,
          cancelReason: reason.trim(),
        })
      )
      cancelled.lines.forEach((l) =>
        mockStore.moveStock({
          productId: l.productId,
          type: "orderCancel",
          delta: () => l.quantity,
          reference: cancelled.code,
          reason: reason.trim(),
        })
      )
      adjustPoints(cancelled.customer.phone, cancelled.pointsUsed)
      return cancelled
    }),
}
