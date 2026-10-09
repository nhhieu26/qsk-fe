import { http, type ApiResponse } from "@/api/http"
import type { ProductsRepository } from "@/features/products/api/products-repository"
import type { Product } from "@/features/products/types"

type ProductBody = ApiResponse<{ product: Product }>

/**
 * Endpoint đề xuất cho backend:
 * - GET    /products                       → { products }
 * - GET    /products/:id                   → { product }
 * - POST   /products                       → { product }
 * - PATCH  /products/:id                   → { product }
 * - PUT    /products/:id/claims            → { product }
 * - POST   /products/:id/documents         → { product }
 * - DELETE /products/:id/documents/:type   → { product }
 */
export const productsHttp: ProductsRepository = {
  async list() {
    const res =
      await http.get<ApiResponse<{ products: Product[] }>>("/products")
    return res.data.data.products
  },

  async get(id) {
    const res = await http.get<ProductBody>(
      `/products/${encodeURIComponent(id)}`
    )
    return res.data.data.product
  },

  async create(input) {
    const res = await http.post<ProductBody>("/products", input)
    return res.data.data.product
  },

  async update(id, input) {
    const res = await http.patch<ProductBody>(
      `/products/${encodeURIComponent(id)}`,
      input
    )
    return res.data.data.product
  },

  async updateClaims(id, claims) {
    const res = await http.put<ProductBody>(
      `/products/${encodeURIComponent(id)}/claims`,
      {
        claims,
      }
    )
    return res.data.data.product
  },

  async addDocument(id, input) {
    const res = await http.post<ProductBody>(
      `/products/${encodeURIComponent(id)}/documents`,
      input
    )
    return res.data.data.product
  },

  async removeDocument(id, type) {
    const res = await http.delete<ProductBody>(
      `/products/${encodeURIComponent(id)}/documents/${encodeURIComponent(type)}`
    )
    return res.data.data.product
  },
}
