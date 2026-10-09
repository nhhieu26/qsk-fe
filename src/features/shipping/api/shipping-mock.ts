import { ApiError } from "@/api/http"
import { PROVINCES } from "@/features/sales/constants"
import {
  isShippingAvailable,
  shippingFee,
  subtotalOf,
} from "@/features/sales/lib/order-totals"
import type { ShippingRepository } from "@/features/shipping/api/shipping-repository"
import { mockStore, withLatency } from "@/mocks/mock-store"

const DEFAULT_WEIGHT_GRAMS = 500
const MOCK_WARDS = ["Phường Trung Tâm", "Phường Bắc", "Phường Nam", "Xã Đông"]

export const shippingMock: ShippingRepository = {
  listProvinces: () =>
    withLatency(() => PROVINCES.map((name, i) => ({ id: i + 1, name }))),

  listWards: (provinceId) =>
    withLatency(() =>
      MOCK_WARDS.map((name, i) => ({ id: provinceId * 100 + i, name }))
    ),

  quote: ({ method, address, lines }) =>
    withLatency(() => {
      const items = lines.map((l) => ({
        product: mockStore.getProduct(l.productId),
        quantity: l.quantity,
      }))
      const subtotal = subtotalOf(
        items.map((i) => ({ price: i.product.price, quantity: i.quantity }))
      )
      if (method !== "pickup" && !address) {
        throw new ApiError("Cần địa chỉ người nhận để giao hàng", 400)
      }
      if (address && !isShippingAvailable(method, address.province)) {
        throw new ApiError("Giao hoả tốc chỉ giao trong tỉnh đặt quầy", 400)
      }
      const fee = shippingFee(method, subtotal)
      return {
        method,
        fee,
        ...(method === "viettel" && fee > 0 && { carrierFee: fee }),
        freeShipping: method === "viettel" && fee === 0,
        weight: items.reduce(
          (sum, i) =>
            sum + (i.product.weight ?? DEFAULT_WEIGHT_GRAMS) * i.quantity,
          0
        ),
      }
    }),
}
