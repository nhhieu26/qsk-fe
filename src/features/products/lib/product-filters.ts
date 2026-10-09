import {
  getMissingDocuments,
  isBelowThreshold,
} from "@/features/products/lib/product-compliance"
import type { Product, ProductCategory } from "@/features/products/types"
import { normalizeSearch } from "@/lib/format"

export type CategoryFilter = "all" | "none" | ProductCategory
export type ComplianceFilter = "all" | "complete" | "missing" | "lowStock"

export type ProductFilterState = {
  query: string
  category: CategoryFilter
  compliance: ComplianceFilter
}

export function matchesCategory(
  product: Product,
  filter: CategoryFilter
): boolean {
  if (filter === "all") return true
  if (filter === "none") return product.category === undefined
  return product.category === filter
}

export function matchesCompliance(
  product: Product,
  filter: ComplianceFilter
): boolean {
  switch (filter) {
    case "all":
      return true
    case "complete":
      return (
        product.category !== undefined &&
        getMissingDocuments(product).length === 0
      )
    case "missing":
      return getMissingDocuments(product).length > 0
    case "lowStock":
      return isBelowThreshold(product)
  }
}

export function filterProducts(
  products: readonly Product[],
  { query, category, compliance }: ProductFilterState
): Product[] {
  const q = normalizeSearch(query)
  return products
    .filter((p) => {
      const haystack = [p.name, p.registrationNo, p.customerGroup].map(
        normalizeSearch
      )
      return !q || haystack.some((h) => h.includes(q))
    })
    .filter(
      (p) => matchesCategory(p, category) && matchesCompliance(p, compliance)
    )
    .sort((a, b) =>
      normalizeSearch(a.name).localeCompare(normalizeSearch(b.name))
    )
}
