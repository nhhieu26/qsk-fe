import { describe, expect, it } from "vitest"

import { queryOrders } from "@/features/sales/lib/order-filters"
import {
  parseOrderListParams,
  toOrderSearchParams,
} from "@/features/sales/lib/order-list-params"
import type { Order } from "@/features/sales/types"

function orderFixture(overrides: Partial<Order>): Order {
  return {
    id: "o",
    code: "DH261008001",
    createdAt: "2026-10-08T03:00:00.000Z",
    createdBy: "a",
    status: "new",
    paymentStatus: "unpaid",
    paymentMethod: "transfer",
    customer: { name: "Nguyễn Thị Lan", phone: "0912345678" },
    shipping: { method: "pickup", fee: 0 },
    lines: [],
    pointsUsed: 0,
    totals: {
      subtotal: 0,
      shippingFee: 0,
      pointsDiscount: 0,
      total: 0,
      earnedPoints: 0,
    },
    ...overrides,
  }
}

const orders = [
  orderFixture({
    id: "a",
    code: "DH261008001",
    createdAt: "2026-10-08T03:00:00.000Z",
  }),
  orderFixture({
    id: "b",
    code: "DH261008002",
    createdAt: "2026-10-08T05:00:00.000Z",
    status: "shipping",
    paymentMethod: "cod",
    shipping: { method: "viettel", fee: 30_000 },
    customer: { name: "Trần Văn Minh", phone: "0987654321" },
  }),
  orderFixture({
    id: "c",
    code: "DH261001001",
    createdAt: "2026-10-01T03:00:00.000Z",
    status: "completed",
  }),
]

const ids = (page: ReturnType<typeof queryOrders>) =>
  page.orders.map((o) => o.id)

describe("queryOrders", () => {
  it("sorts newest first", () => {
    expect(ids(queryOrders(orders, { page: 1, limit: 20 }))).toEqual([
      "b",
      "a",
      "c",
    ])
  })

  it("searches by name without accents and by phone fragment", () => {
    expect(
      ids(queryOrders(orders, { q: "van minh", page: 1, limit: 20 }))
    ).toEqual(["b"])
    expect(
      ids(queryOrders(orders, { q: "345678", page: 1, limit: 20 }))
    ).toEqual(["a", "c"])
  })

  it("filters by date range inclusively", () => {
    const page = queryOrders(orders, {
      from: "2026-10-08",
      to: "2026-10-08",
      page: 1,
      limit: 20,
    })
    expect(ids(page)).toEqual(["b", "a"])
  })

  it("counts every status under the other filters, ignoring the active tab", () => {
    const page = queryOrders(orders, { status: "shipping", page: 1, limit: 20 })
    expect(ids(page)).toEqual(["b"])
    expect(page.counts).toMatchObject({
      all: 3,
      new: 1,
      shipping: 1,
      completed: 1,
      approved: 0,
    })
  })

  it("paginates", () => {
    const page = queryOrders(orders, { page: 2, limit: 2 })
    expect(ids(page)).toEqual(["c"])
    expect(page.pagination).toMatchObject({
      total: 3,
      totalPages: 2,
      hasPrev: true,
      hasNext: false,
    })
  })
})

describe("order list URL params", () => {
  it("ignores unknown values instead of failing", () => {
    const params = parseOrderListParams(
      new URLSearchParams("status=bogus&page=-3&paymentMethod=cod")
    )
    expect(params).toMatchObject({
      status: undefined,
      page: 1,
      paymentMethod: "cod",
    })
  })

  it("drops an inverted date range end", () => {
    const params = parseOrderListParams(
      new URLSearchParams("from=2026-10-08&to=2026-10-01")
    )
    expect(params).toMatchObject({ from: "2026-10-08", to: undefined })
  })

  it("resets to page 1 when a filter changes and omits empty values", () => {
    const current = parseOrderListParams(
      new URLSearchParams("status=new&page=3")
    )
    expect(toOrderSearchParams(current, { q: "lan" }).toString()).toBe(
      "status=new&q=lan"
    )
  })

  it("keeps the requested page when only the page changes", () => {
    const current = parseOrderListParams(new URLSearchParams("status=new"))
    expect(toOrderSearchParams(current, { page: 2 }).toString()).toBe(
      "status=new&page=2"
    )
  })
})
