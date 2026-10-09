import { http, type ApiResponse } from "@/api/http"
import type { SettingsRepository } from "@/features/settings/api/settings-repository"
import type { ShopSettings } from "@/features/settings/types"

type SettingsBody = ApiResponse<{ settings: ShopSettings }>

/**
 * - GET /settings                    → { settings }  (quyền settings.view)
 * - PUT /settings/store              → { settings }  (quyền settings.update)
 * - PUT /settings/payment-account    → { settings }  (quyền settings.update)
 *
 * Tài khoản nhận tiền lưu ở đây được dùng cho QR thanh toán đơn hàng
 * (`GET /orders/:id/payment`).
 */
export const settingsHttp: SettingsRepository = {
  async get() {
    const res = await http.get<SettingsBody>("/settings")
    return res.data.data.settings
  },

  async updateStore(input) {
    const res = await http.put<SettingsBody>("/settings/store", input)
    return res.data.data.settings
  },

  async updatePaymentAccount(input) {
    const res = await http.put<SettingsBody>("/settings/payment-account", input)
    return res.data.data.settings
  },
}
