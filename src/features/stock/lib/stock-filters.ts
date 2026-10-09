import type { Product } from "@/features/products/types"
import { MOVEMENT_TYPES } from "@/features/stock/constants"
import type { StockMovement } from "@/features/stock/types"
import { normalizeSearch, toIsoDate } from "@/lib/format"

export type InventoryFilter = "all" | "below" | "out" | "loaned"

export function matchesInventoryFilter(
  product: Product,
  filter: InventoryFilter
): boolean {
  switch (filter) {
    case "all":
      return true
    case "below":
      return product.stock <= product.threshold
    case "out":
      return product.stock <= 0
    case "loaned":
      return product.loans.length > 0
  }
}

export function filterInventory(
  products: readonly Product[],
  filter: InventoryFilter,
  query: string
): Product[] {
  const q = normalizeSearch(query)
  return products
    .filter((p) => matchesInventoryFilter(p, filter))
    .filter(
      (p) =>
        !q ||
        normalizeSearch(p.name).includes(q) ||
        normalizeSearch(p.registrationNo).includes(q)
    )
    .sort((a, b) =>
      normalizeSearch(a.name).localeCompare(normalizeSearch(b.name))
    )
}

export function filterMovements(
  movements: readonly StockMovement[],
  query: string
): StockMovement[] {
  const q = normalizeSearch(query)
  if (!q) return [...movements]
  return movements.filter((m) =>
    normalizeSearch(
      [
        m.productName,
        MOVEMENT_TYPES[m.type].label,
        m.actor,
        m.reason,
        m.reference,
      ].join(" ")
    ).includes(q)
  )
}

export type StockSummary = {
  totalProducts: number
  inStock: number
  below: number
  out: number
  loanCount: number
  loanedProducts: number
  monthSaleQuantity: number
  monthSaleAmount: number
}

export function summarizeStock(
  products: readonly Product[],
  movements: readonly StockMovement[],
  today = new Date()
): StockSummary {
  const out = products.filter((p) => p.stock <= 0).length
  const month = toIsoDate(today).slice(0, 7)
  const priceOf = new Map(products.map((p) => [p.id, p.price]))
  const monthSales = movements.filter(
    (m) =>
      m.type === "sale" &&
      toIsoDate(new Date(m.createdAt)).slice(0, 7) === month
  )

  return {
    totalProducts: products.length,
    inStock: products.length - out,
    below: products.filter((p) => p.stock <= p.threshold).length,
    out,
    loanCount: products.reduce((sum, p) => sum + p.loans.length, 0),
    loanedProducts: products.filter((p) => p.loans.length > 0).length,
    monthSaleQuantity: monthSales.reduce((sum, m) => sum - m.quantity, 0),
    monthSaleAmount: monthSales.reduce(
      (sum, m) => sum - m.quantity * (priceOf.get(m.productId) ?? 0),
      0
    ),
  }
}
