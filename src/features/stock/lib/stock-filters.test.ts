import { describe, expect, it } from "vitest"

import type { Product } from "@/features/products/types"
import {
  filterInventory,
  summarizeStock,
} from "@/features/stock/lib/stock-filters"
import { getStockStatus } from "@/features/stock/lib/stock-status"
import type { StockMovement } from "@/features/stock/types"

function productFixture(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "Canxi",
    price: 100,
    stock: 20,
    threshold: 5,
    documents: [],
    claims: [],
    loans: [],
    ...overrides,
  }
}

function sale(
  productId: string,
  quantity: number,
  createdAt: string
): StockMovement {
  return {
    id: `${productId}-${createdAt}`,
    productId,
    productName: productId,
    type: "sale",
    quantity: -quantity,
    before: 10,
    after: 10 - quantity,
    actor: "a",
    createdAt,
  }
}

describe("getStockStatus", () => {
  it.each([
    [0, "Hết hàng"],
    [5, "Dưới ngưỡng"],
    [7, "Gần ngưỡng"],
    [20, "Đủ hàng"],
  ])("stock %i → %s", (stock, label) => {
    expect(getStockStatus(productFixture({ stock })).label).toBe(label)
  })
})

describe("filterInventory", () => {
  const products = [
    productFixture({ id: "out", name: "B", stock: 0 }),
    productFixture({ id: "ok", name: "A" }),
    productFixture({
      id: "loan",
      name: "C",
      loans: [{ id: "l", borrower: "x", quantity: 1, date: "2026-01-01" }],
    }),
  ]

  it("keeps only out-of-stock items", () => {
    expect(filterInventory(products, "out", "").map((p) => p.id)).toEqual([
      "out",
    ])
  })

  it("keeps only loaned items", () => {
    expect(filterInventory(products, "loaned", "").map((p) => p.id)).toEqual([
      "loan",
    ])
  })

  it("sorts by name", () => {
    expect(filterInventory(products, "all", "").map((p) => p.name)).toEqual([
      "A",
      "B",
      "C",
    ])
  })
})

describe("summarizeStock", () => {
  it("counts only sales in the current month", () => {
    const products = [productFixture({ id: "p1", price: 1000 })]
    const movements = [
      sale("p1", 2, "2026-10-03T10:00:00.000Z"),
      sale("p1", 5, "2026-09-03T10:00:00.000Z"),
    ]
    const summary = summarizeStock(
      products,
      movements,
      new Date("2026-10-08T12:00:00.000Z")
    )
    expect(summary.monthSaleQuantity).toBe(2)
    expect(summary.monthSaleAmount).toBe(2000)
  })
})
