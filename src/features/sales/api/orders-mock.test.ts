import { describe, expect, it } from "vitest"

import { ordersMock } from "@/features/sales/api/orders-mock"
import type { CreateOrderInput } from "@/features/sales/types"
import { mockStore } from "@/mocks/mock-store"

// Dữ liệu mẫu: sp-tra giá 95.000đ, tồn 40; khách kh-lan có 45.000 điểm Mi.
function input(overrides: Partial<CreateOrderInput> = {}): CreateOrderInput {
  return {
    lines: [{ productId: "sp-tra", quantity: 2 }],
    customer: { name: "Khách mới", phone: "0933333333" },
    shipping: { method: "pickup" },
    payment: { method: "transfer", pointsUsed: 0, collectedNow: false },
    expectedTotal: 190_000,
    ...overrides,
  }
}

const stockOf = (id: string) => mockStore.getProduct(id).stock
const pointsOf = (phone: string) =>
  mockStore.listCustomers().find((c) => c.phone === phone)?.points

describe("ordersMock", () => {
  it("creates an unpaid transfer order and deducts stock", async () => {
    const before = stockOf("sp-tra")
    const order = await ordersMock.create(input())
    expect(order).toMatchObject({ status: "new", paymentStatus: "unpaid" })
    expect(order.code).toMatch(/^DH\d{6}\d{3}$/)
    expect(stockOf("sp-tra")).toBe(before - 2)
  })

  it("saves a new customer by phone", async () => {
    await ordersMock.create(
      input({ customer: { name: "Chị Hoa", phone: "0944444444" } })
    )
    expect(
      mockStore.listCustomers().some((c) => c.phone === "0944444444")
    ).toBe(true)
  })

  it("rejects an order when the price changed", async () => {
    await expect(
      ordersMock.create(input({ expectedTotal: 1 }))
    ).rejects.toThrow(/thay đổi/)
  })

  it("rejects more than the stock on hand", async () => {
    const order = input({
      lines: [{ productId: "sp-sua", quantity: 1 }],
      expectedTotal: 620_000,
    })
    await expect(ordersMock.create(order)).rejects.toThrow(/chỉ còn/)
  })

  it("completes a cash pickup immediately and awards points", async () => {
    const before = pointsOf("0912345678") ?? 0
    const order = await ordersMock.create(
      input({
        customer: { id: "kh-lan", name: "Nguyễn Thị Lan", phone: "0912345678" },
        payment: { method: "cash", pointsUsed: 10_000, collectedNow: true },
        expectedTotal: 180_000,
      })
    )
    expect(order).toMatchObject({ status: "completed", paymentStatus: "paid" })
    // −10.000 điểm dùng, +18.000 điểm tích (10% của 180.000).
    expect(pointsOf("0912345678")).toBe(before - 10_000 + 18_000)
  })

  it("restocks and refunds points when cancelled", async () => {
    const stockBefore = stockOf("sp-tra")
    const pointsBefore = pointsOf("0912345678") ?? 0
    const order = await ordersMock.create(
      input({
        customer: { id: "kh-lan", name: "Nguyễn Thị Lan", phone: "0912345678" },
        payment: { method: "transfer", pointsUsed: 5_000, collectedNow: false },
        expectedTotal: 185_000,
      })
    )
    const cancelled = await ordersMock.cancel(order.id, {
      reason: "Khách đổi ý",
    })
    expect(cancelled.status).toBe("cancelled")
    expect(stockOf("sp-tra")).toBe(stockBefore)
    expect(pointsOf("0912345678")).toBe(pointsBefore)
  })

  it("walks a delivery through paid → approved → awaiting pickup → shipping → completed", async () => {
    const order = await ordersMock.create(
      input({
        shipping: {
          method: "viettel",
          recipient: {
            name: "A",
            phone: "0933333333",
            address: {
              province: "Cà Mau",
              ward: "Phường 1",
              street: "1 Đường A",
            },
          },
        },
        expectedTotal: 220_000,
      })
    )
    await expect(ordersMock.approve(order.id)).rejects.toThrow()
    await ordersMock.markPaid(order.id)
    await ordersMock.approve(order.id)
    const handed = await ordersMock.handOver(order.id, {
      trackingCode: " VT123 ",
    })
    expect(handed).toMatchObject({
      status: "awaitingPickup",
      shipping: { trackingCode: "VT123" },
    })
    expect((await ordersMock.markShipping(order.id)).status).toBe("shipping")
    expect((await ordersMock.complete(order.id)).status).toBe("completed")
  })

  it("lists with filters, pagination and per-status counts", async () => {
    const order = await ordersMock.create(
      input({ customer: { name: "Bà Tư", phone: "0955555555" } })
    )
    const page = await ordersMock.list({ q: "ba tu", page: 1, limit: 20 })
    expect(page.orders.map((o) => o.id)).toEqual([order.id])
    expect(page.counts).toMatchObject({ all: 1, new: 1 })
    expect(page.pagination).toMatchObject({ total: 1, totalPages: 1 })
  })

  it("updates and clears the note", async () => {
    const order = await ordersMock.create(input())
    expect((await ordersMock.updateNote(order.id, "  Gọi trước  ")).note).toBe(
      "Gọi trước"
    )
    expect((await ordersMock.updateNote(order.id, "")).note).toBeUndefined()
  })

  it("returns VietQR payment info with the order code as transfer content", async () => {
    const order = await ordersMock.create(input())
    const info = await ordersMock.getPaymentInfo(order.id)
    expect(info).toMatchObject({ amount: 190_000, transferContent: order.code })
    expect(info.qrPayload).toContain(order.code)
  })
})
