import { http, type ApiResponse } from "@/api/http"
import type { CustomersRepository } from "@/features/customers/api/customers-repository"
import type { Customer } from "@/features/customers/types"

/**
 * Endpoint đề xuất cho backend:
 * - GET /customers?q=   → { customers }
 *
 * Khách mới được backend tạo/cập nhật (upsert theo số điện thoại) khi lên đơn,
 * nên frontend không cần API tạo khách riêng.
 */
export const customersHttp: CustomersRepository = {
  async search(query) {
    const res = await http.get<ApiResponse<{ customers: Customer[] }>>(
      "/customers",
      {
        params: { q: query },
      }
    )
    return res.data.data.customers
  },
}
