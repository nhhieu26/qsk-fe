import {
  DOCUMENT_EXPIRY_WARNING_DAYS,
  DOCUMENT_TYPES,
  FORBIDDEN_CLAIMS_DEFAULT,
  FORBIDDEN_CLAIMS_DEVICE,
  PRODUCT_CATEGORIES,
  UNCATEGORIZED_COLOR,
} from "@/features/products/constants"
import type {
  DocumentType,
  Product,
  ProductCategory,
} from "@/features/products/types"
import { daysUntil } from "@/lib/format"

export const CATEGORY_KEYS = Object.keys(
  PRODUCT_CATEGORIES
) as ProductCategory[]

export function categoryLabel(category: ProductCategory | undefined): string {
  return category ? PRODUCT_CATEGORIES[category].label : "Chưa phân loại"
}

export function categoryColor(
  category: ProductCategory | undefined
): readonly [string, string] {
  return category ? PRODUCT_CATEGORIES[category].color : UNCATEGORIZED_COLOR
}

export function documentLabel(type: DocumentType, product?: Product): string {
  if (type === "registration" && product?.category) {
    return PRODUCT_CATEGORIES[product.category].registrationLabel
  }
  return DOCUMENT_TYPES.find((d) => d.key === type)?.label ?? type
}

export function isDocumentRequired(
  type: DocumentType,
  product: Product
): boolean {
  if (!product.category) return false
  const required: readonly DocumentType[] =
    PRODUCT_CATEGORIES[product.category].requiredDocuments
  return required.includes(type)
}

/** Danh sách lỗi hồ sơ: thiếu giấy bắt buộc hoặc giấy đã hết hạn. */
export function getMissingDocuments(product: Product): string[] {
  if (!product.category) return []
  return DOCUMENT_TYPES.flatMap(({ key }) => {
    if (!isDocumentRequired(key, product)) return []
    const doc = product.documents.find((d) => d.type === key)
    const label = documentLabel(key, product)
    if (!doc) return [`Thiếu ${label}`]
    if (doc.expiresAt && daysUntil(doc.expiresAt) < 0)
      return [`${label} đã hết hạn`]
    return []
  })
}

export type ExpiringDocument = {
  product: Product
  type: DocumentType
  daysLeft: number
}

export function getExpiringDocuments(
  products: readonly Product[]
): ExpiringDocument[] {
  return products.flatMap((product) =>
    product.documents.flatMap((doc) => {
      if (!doc.expiresAt) return []
      const daysLeft = daysUntil(doc.expiresAt)
      return daysLeft >= 0 && daysLeft <= DOCUMENT_EXPIRY_WARNING_DAYS
        ? [{ product, type: doc.type, daysLeft }]
        : []
    })
  )
}

export function forbiddenClaims(product: Product): readonly string[] {
  return product.category === "medicalDevice"
    ? FORBIDDEN_CLAIMS_DEVICE
    : FORBIDDEN_CLAIMS_DEFAULT
}

export function requiresAnchor(product: Product): boolean {
  return product.category
    ? PRODUCT_CATEGORIES[product.category].requiresAnchor
    : false
}

export function isBelowThreshold(product: Product): boolean {
  return product.stock <= product.threshold
}
