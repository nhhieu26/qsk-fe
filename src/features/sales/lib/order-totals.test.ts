import { describe, expect, it } from "vitest"

import {
  calculateTotals,
  isShippingAvailable,
  shippingFee,
} from "@/features/sales/lib/order-totals"
import { crc16, buildVietQrPayload } from "@/features/sales/lib/vietqr"

const lines = [
  { price: 100_000, quantity: 2 },
  { price: 50_000, quantity: 1 },
]

describe("shippingFee", () => {
  it("is free for pickup", () => {
    expect(shippingFee("pickup", 10_000)).toBe(0)
  })

  it("charges the base Viettel fee below the free threshold", () => {
    expect(shippingFee("viettel", 499_999)).toBe(30_000)
  })

  it("waives the Viettel fee from the free threshold", () => {
    expect(shippingFee("viettel", 500_000)).toBe(0)
  })

  it("always charges express", () => {
    expect(shippingFee("express", 5_000_000)).toBe(50_000)
  })
})

describe("isShippingAvailable", () => {
  it("allows express only inside the store province", () => {
    expect(isShippingAvailable("express", "Hà Nội")).toBe(true)
    expect(isShippingAvailable("express", "Đà Nẵng")).toBe(false)
  })

  it("allows Viettel anywhere", () => {
    expect(isShippingAvailable("viettel", "Cà Mau")).toBe(true)
  })
})

describe("calculateTotals", () => {
  it("adds shipping to the subtotal", () => {
    const t = calculateTotals({
      lines,
      shippingMethod: "express",
      pointsUsed: 0,
      availablePoints: 0,
    })
    expect(t).toMatchObject({
      subtotal: 250_000,
      shippingFee: 50_000,
      total: 300_000,
    })
  })

  it("caps points at what the customer has", () => {
    const t = calculateTotals({
      lines,
      shippingMethod: "pickup",
      pointsUsed: 90_000,
      availablePoints: 20_000,
    })
    expect(t.pointsDiscount).toBe(20_000)
  })

  it("never lets points pay for shipping", () => {
    const t = calculateTotals({
      lines,
      shippingMethod: "express",
      pointsUsed: 999_999,
      availablePoints: 999_999,
    })
    expect(t.total).toBe(50_000)
  })

  it("earns 10% on goods actually paid, not on shipping", () => {
    const t = calculateTotals({
      lines,
      shippingMethod: "express",
      pointsUsed: 50_000,
      availablePoints: 50_000,
    })
    expect(t.earnedPoints).toBe(20_000)
  })
})

describe("vietqr", () => {
  it("computes CRC-16/CCITT-FALSE", () => {
    expect(crc16("123456789")).toBe("29B1")
  })

  it("embeds bank, account, amount and content with a valid checksum", () => {
    const payload = buildVietQrPayload({
      bankBin: "970436",
      accountNumber: "0011001234567",
      amount: 150_000,
      content: "DH261008001",
    })
    expect(payload).toContain("970436")
    expect(payload).toContain("0011001234567")
    expect(payload).toContain("5406150000")
    expect(payload).toContain("DH261008001")
    expect(payload.slice(-4)).toBe(crc16(payload.slice(0, -4)))
  })

  it("omits the amount field when amount is zero", () => {
    const payload = buildVietQrPayload({
      bankBin: "970436",
      accountNumber: "1",
      amount: 0,
      content: "X",
    })
    expect(payload).not.toContain("5401")
  })
})
