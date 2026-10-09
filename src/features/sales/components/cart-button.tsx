import { Link } from "react-router"
import { ShoppingCart } from "lucide-react"

import { cartItemCount, useCartStore } from "@/features/sales/store/cart-store"
import { subtotalOf } from "@/features/sales/lib/order-totals"
import { formatVnd } from "@/lib/format"
import { cn } from "@/lib/utils"

export function CartButton({ isActive = false }: { isActive?: boolean }) {
  const cart = useCartStore((s) => s.cart)
  const count = cartItemCount(cart)
  const amount = subtotalOf(cart)

  return (
    <Link
      to="/sales/cart"
      className={cn(
        "relative inline-flex h-[42px] items-center gap-2 rounded-[10px] border border-[#D9E0E8] bg-white px-3.5 text-[13.5px] font-semibold hover:border-primary hover:text-primary",
        isActive && "border-primary text-primary"
      )}
    >
      <ShoppingCart className="size-[18px]" aria-hidden="true" />
      Giỏ hàng
      {count > 0 && (
        <i className="absolute -top-[7px] left-[22px] grid h-[19px] min-w-[19px] place-items-center rounded-full border-2 border-white bg-pink-700 px-1 text-[11px] font-bold text-white not-italic">
          {count}
        </i>
      )}
      {amount > 0 && (
        <b className="ml-0.5 border-l pl-2.5 text-primary tabular-nums">
          {formatVnd(amount)}
        </b>
      )}
    </Link>
  )
}

/** Thanh nổi đáy màn hình khi giỏ có hàng. */
export function CartFloatingBar() {
  const cart = useCartStore((s) => s.cart)
  const count = cartItemCount(cart)
  if (count === 0) return null

  return (
    <Link
      to="/sales/cart"
      className="fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-brand px-5 py-3 text-sm text-white shadow-[0_10px_30px_-10px_rgba(16,27,51,.5)] hover:bg-brand/90 lg:left-[calc(50%+128px)]"
    >
      <ShoppingCart className="size-[18px]" aria-hidden="true" />
      <span>
        {count} sản phẩm ·{" "}
        <b className="tabular-nums">{formatVnd(subtotalOf(cart))}</b>
      </span>
      <em className="font-semibold not-italic opacity-90">Xem giỏ hàng ›</em>
    </Link>
  )
}
