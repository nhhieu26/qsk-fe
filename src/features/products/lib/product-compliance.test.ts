import { describe, expect, it } from "vitest"

import {
  getExpiringDocuments,
  getMissingDocuments,
} from "@/features/products/lib/product-compliance"
import { filterProducts } from "@/features/products/lib/product-filters"
import type { Product, ProductDocument } from "@/features/products/types"
import { toIsoDate } from "@/lib/format"

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

function doc(
  type: ProductDocument["type"],
  expiresAt?: string
): ProductDocument {
  return {
    type,
    url: "https://x.test/a.pdf",
    expiresAt,
    uploadedBy: "a",
    uploadedAt: "2026-01-01",
  }
}

function inDays(days: number): string {
  return toIsoDate(new Date(Date.now() + days * 86_400_000))
}

describe("getMissingDocuments", () => {
  it("returns nothing for an uncategorized product", () => {
    expect(getMissingDocuments(productFixture())).toEqual([])
  })

  it("lists every required document that is missing", () => {
    const p = productFixture({ category: "supplement" })
    expect(getMissingDocuments(p)).toHaveLength(2)
  })

  it("flags a required document that has expired", () => {
    const p = productFixture({
      category: "food",
      documents: [doc("registration", inDays(-1))],
    })
    expect(getMissingDocuments(p)[0]).toMatch(/đã hết hạn/)
  })

  it("passes when required documents are present and valid", () => {
    const p = productFixture({
      category: "food",
      documents: [doc("registration")],
    })
    expect(getMissingDocuments(p)).toEqual([])
  })
})

describe("getExpiringDocuments", () => {
  it("includes documents expiring within the warning window", () => {
    const p = productFixture({ documents: [doc("label", inDays(10))] })
    expect(getExpiringDocuments([p])).toHaveLength(1)
  })

  it("excludes documents far from expiry", () => {
    const p = productFixture({ documents: [doc("label", inDays(200))] })
    expect(getExpiringDocuments([p])).toEqual([])
  })
})

describe("filterProducts", () => {
  const products = [
    productFixture({
      id: "a",
      name: "Sữa bột",
      category: "food",
      documents: [doc("registration")],
    }),
    productFixture({
      id: "b",
      name: "Canxi",
      category: "supplement",
      stock: 1,
    }),
  ]

  it("searches without Vietnamese diacritics", () => {
    const result = filterProducts(products, {
      query: "sua",
      category: "all",
      compliance: "all",
    })
    expect(result.map((p) => p.id)).toEqual(["a"])
  })

  it("filters by missing documents", () => {
    const result = filterProducts(products, {
      query: "",
      category: "all",
      compliance: "missing",
    })
    expect(result.map((p) => p.id)).toEqual(["b"])
  })

  it("filters by low stock", () => {
    const result = filterProducts(products, {
      query: "",
      category: "all",
      compliance: "lowStock",
    })
    expect(result.map((p) => p.id)).toEqual(["b"])
  })
})
