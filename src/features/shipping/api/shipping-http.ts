import { http, type ApiResponse } from "@/api/http"
import type { ShippingRepository } from "@/features/shipping/api/shipping-repository"
import type { AreaOption, ShippingQuote } from "@/features/shipping/types"

/**
 * - GET  /shipping/provinces                     → { provinces } (ViettelPost, cache 24h)
 * - GET  /shipping/provinces/:provinceId/wards   → { wards }
 * - POST /shipping/quote                         → { quote }
 *
 * Phí Viettel Post là phí thật theo địa chỉ + cân nặng; đơn từ 500.000đ miễn
 * phí. Lấy `quote.fee` truyền vào `calculateTotals` để `expectedTotal` khớp.
 */
export const shippingHttp: ShippingRepository = {
  async listProvinces() {
    const res = await http.get<ApiResponse<{ provinces: AreaOption[] }>>(
      "/shipping/provinces"
    )
    return res.data.data.provinces
  },

  async listWards(provinceId) {
    const res = await http.get<ApiResponse<{ wards: AreaOption[] }>>(
      `/shipping/provinces/${provinceId}/wards`
    )
    return res.data.data.wards
  },

  async quote(input) {
    const res = await http.post<ApiResponse<{ quote: ShippingQuote }>>(
      "/shipping/quote",
      input
    )
    return res.data.data.quote
  },
}
