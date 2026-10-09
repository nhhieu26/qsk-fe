import { describe, expect, it } from "vitest"

import {
  availableActions,
  needsPaymentRequest,
} from "@/features/sales/lib/order-workflow"
import type { Order } from "@/features/sales/types"

function orderFixture(overrides: Partial<Order> = {}): Order {
  return {
    id: "o1",
    code: "DH261008001",
    createdAt: "2026-10-08T03:00:00.000Z",
    createdBy: "a",
    status: "new",
    paymentStatus: "unpaid",
    paymentMethod: "transfer",
    customer: { name: "Lan", phone: "0912345678" },
    shipping: { method: "viettel", fee: 30_000 },
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

const PICKUP = { method: "pickup", fee: 0 } as const

describe("availableActions", () => {
  it("does not approve an unpaid transfer order", () => {
    expect(availableActions(orderFixture()).canApprove).toBe(false)
  })

  it("approves a paid order, a COD order, or a pickup paid in cash later", () => {
    expect(
      availableActions(orderFixture({ paymentStatus: "paid" })).canApprove
    ).toBe(true)
    expect(
      availableActions(orderFixture({ paymentMethod: "cod" })).canApprove
    ).toBe(true)
    expect(
      availableActions(
        orderFixture({ shipping: PICKUP, paymentMethod: "cash" })
      ).canApprove
    ).toBe(true)
  })

  it("does not approve a delivery paid in cash before payment", () => {
    expect(
      availableActions(orderFixture({ paymentMethod: "cash" })).canApprove
    ).toBe(false)
  })

  it("hands a delivery over only once approved", () => {
    expect(
      availableActions(orderFixture({ status: "approved" })).canHandOver
    ).toBe(true)
    expect(
      availableActions(orderFixture({ status: "new", paymentStatus: "paid" }))
        .canHandOver
    ).toBe(false)
  })

  it("never hands over or ships a pickup order", () => {
    const actions = availableActions(
      orderFixture({ shipping: PICKUP, status: "approved" })
    )
    expect(actions.canHandOver).toBe(false)
    expect(actions.canMarkReady).toBe(true)
  })

  it("moves awaiting pickup to shipping", () => {
    expect(
      availableActions(orderFixture({ status: "awaitingPickup" }))
        .canMarkShipping
    ).toBe(true)
  })

  it("completes a delivery only while shipping", () => {
    expect(
      availableActions(orderFixture({ status: "awaitingPickup" })).canComplete
    ).toBe(false)
    expect(
      availableActions(orderFixture({ status: "shipping" })).canComplete
    ).toBe(true)
  })

  it("completes a pickup only when ready and paid", () => {
    const ready = orderFixture({ shipping: PICKUP, status: "readyForPickup" })
    expect(availableActions(ready).canComplete).toBe(false)
    expect(
      availableActions({ ...ready, paymentStatus: "paid" }).canComplete
    ).toBe(true)
  })

  it("cancels until the goods leave the counter", () => {
    expect(
      availableActions(orderFixture({ status: "awaitingPickup" })).canCancel
    ).toBe(true)
    expect(
      availableActions(orderFixture({ status: "shipping" })).canCancel
    ).toBe(false)
  })

  it("offers nothing on a cancelled order", () => {
    expect(
      Object.values(availableActions(orderFixture({ status: "cancelled" })))
    ).toEqual(Array(7).fill(false))
  })
})

describe("needsPaymentRequest", () => {
  it("is true for an unpaid transfer order", () => {
    expect(needsPaymentRequest(orderFixture())).toBe(true)
  })

  it("is false for COD", () => {
    expect(needsPaymentRequest(orderFixture({ paymentMethod: "cod" }))).toBe(
      false
    )
  })

  it("is false once paid", () => {
    expect(needsPaymentRequest(orderFixture({ paymentStatus: "paid" }))).toBe(
      false
    )
  })
})
