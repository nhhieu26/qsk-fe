import { http, type ApiResponse } from "@/api/http"
import type { Product } from "@/features/products/types"
import type { StockRepository } from "@/features/stock/api/stock-repository"
import type { StockMovement } from "@/features/stock/types"

type ProductBody = ApiResponse<{ product: Product }>

/**
 * Endpoint đề xuất cho backend (mọi thay đổi tồn phải ghi thẻ kho trong
 * cùng transaction):
 * - GET  /stock/movements?productId=        → { movements } (mới nhất trước)
 * - POST /stock/imports                     → { product }
 * - POST /stock/adjustments                 → { product }
 * - POST /stock/stocktakes                  → { adjustedCount }
 * - POST /stock/loans/:loanId/returns       → { product }
 */
export const stockHttp: StockRepository = {
  async listMovements(filter) {
    const res = await http.get<ApiResponse<{ movements: StockMovement[] }>>(
      "/stock/movements",
      { params: filter }
    )
    return res.data.data.movements
  },

  async importStock(input) {
    const res = await http.post<ProductBody>("/stock/imports", input)
    return res.data.data.product
  },

  async adjust(input) {
    const res = await http.post<ProductBody>("/stock/adjustments", input)
    return res.data.data.product
  },

  async stocktake(input) {
    const res = await http.post<ApiResponse<{ adjustedCount: number }>>(
      "/stock/stocktakes",
      input
    )
    return res.data.data
  },

  async returnLoan({ loanId, ...body }) {
    const res = await http.post<ProductBody>(
      `/stock/loans/${encodeURIComponent(loanId)}/returns`,
      body
    )
    return res.data.data.product
  },
}
