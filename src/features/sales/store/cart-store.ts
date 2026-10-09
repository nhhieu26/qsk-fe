import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { CartLine } from "@/features/sales/types"

/** `cart`: đặt từ giỏ hàng; `buyNow`: bấm "Mua ngay" một sản phẩm, không đụng giỏ. */
export type CheckoutSource = "cart" | "buyNow"

type ProductRef = { id: string; name: string; price: number }

type CartState = {
  cart: readonly CartLine[]
  buyNow: readonly CartLine[]
  /** Thêm 1 đơn vị; trả `false` nếu đã đủ số tồn. */
  addLine: (
    source: CheckoutSource,
    product: ProductRef,
    maxQuantity: number
  ) => boolean
  setQuantity: (
    source: CheckoutSource,
    productId: string,
    quantity: number
  ) => void
  removeLine: (source: CheckoutSource, productId: string) => void
  clear: (source: CheckoutSource) => void
  startBuyNow: (product: ProductRef) => void
}

function withQuantity(
  lines: readonly CartLine[],
  productId: string,
  quantity: number
): CartLine[] {
  return quantity <= 0
    ? lines.filter((l) => l.productId !== productId)
    : lines.map((l) => (l.productId === productId ? { ...l, quantity } : l))
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      buyNow: [],

      addLine: (source, product, maxQuantity) => {
        const lines = get()[source]
        const existing = lines.find((l) => l.productId === product.id)
        if (existing) {
          if (existing.quantity >= maxQuantity) return false
          set({
            [source]: withQuantity(lines, product.id, existing.quantity + 1),
          })
          return true
        }
        if (maxQuantity < 1) return false
        set({
          [source]: [
            ...lines,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
            },
          ],
        })
        return true
      },

      setQuantity: (source, productId, quantity) =>
        set({ [source]: withQuantity(get()[source], productId, quantity) }),

      removeLine: (source, productId) =>
        set({
          [source]: get()[source].filter((l) => l.productId !== productId),
        }),

      clear: (source) => set({ [source]: [] }),

      startBuyNow: (product) =>
        set({
          buyNow: [
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
            },
          ],
        }),
    }),
    {
      name: "qsk.cart",
      // Giỏ chỉ sống trong tab hiện tại; lỗi storage (chế độ riêng tư) thì chạy bằng bộ nhớ.
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export function cartItemCount(lines: readonly CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0)
}
