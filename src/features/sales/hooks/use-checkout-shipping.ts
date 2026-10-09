import { useWatch, type Control } from "react-hook-form"

import { SHIPPING_METHODS } from "@/features/sales/constants"
import type { CheckoutFormInput } from "@/features/sales/lib/checkout-schema"
import { shippingFee } from "@/features/sales/lib/order-totals"
import type { CartLine } from "@/features/sales/types"
import { useShippingQuote } from "@/features/shipping/hooks/use-shipping"
import type { ShippingQuoteInput } from "@/features/shipping/types"
import { useDebouncedValue } from "@/lib/use-debounced-value"

const STREET_DEBOUNCE_MS = 600

export type CheckoutShipping =
  /** Đã có phí chắc chắn (tại quầy, hoả tốc, miễn phí, hoặc ViettelPost đã báo). */
  | { status: "ready"; fee: number }
  /** Giao Viettel nhưng chưa đủ tỉnh/phường/đường để báo phí. */
  | { status: "needsAddress"; estimate: number }
  | { status: "loading"; estimate: number }
  | { status: "error"; estimate: number; error: unknown }

/**
 * Phí ship cho trang đặt hàng. Viettel Post lấy giá thật qua
 * `POST /shipping/quote` (ViettelPost getPriceNlp, giống `transpost-fee` bên prm);
 * backend tạo đơn báo phí lại cùng công thức nên `expectedTotal` khớp.
 */
export function useCheckoutShipping(
  control: Control<CheckoutFormInput>,
  lines: readonly Pick<CartLine, "productId" | "quantity" | "price">[],
  subtotal: number
): CheckoutShipping {
  const [method, province, ward, street, paymentMethod] = useWatch({
    control,
    name: [
      "shipping.method",
      "shipping.province",
      "shipping.ward",
      "shipping.street",
      "payment.method",
    ],
  })
  const debouncedStreet = useDebouncedValue(street.trim(), STREET_DEBOUNCE_MS)
  const tableFee = shippingFee(method, subtotal)
  const isFree =
    method === "viettel" && subtotal >= SHIPPING_METHODS.viettel.freeFrom
  const needsQuote = method === "viettel" && !isFree
  const hasAddress = province !== "" && ward !== "" && debouncedStreet !== ""

  const input: ShippingQuoteInput | undefined =
    needsQuote && hasAddress && lines.length > 0
      ? {
          method,
          address: { province, ward, street: debouncedStreet },
          lines: lines.map(({ productId, quantity }) => ({
            productId,
            quantity,
          })),
          paymentMethod,
        }
      : undefined
  const quote = useShippingQuote(input)

  if (!needsQuote) return { status: "ready", fee: tableFee }
  if (!input) return { status: "needsAddress", estimate: tableFee }
  if (quote.error) {
    return { status: "error", estimate: tableFee, error: quote.error }
  }
  // `placeholderData` giữ giá cũ khi đổi địa chỉ: chỉ coi là xong khi đã hết tải.
  if (quote.data && !quote.isFetching) {
    return { status: "ready", fee: quote.data.fee }
  }
  return { status: "loading", estimate: tableFee }
}
