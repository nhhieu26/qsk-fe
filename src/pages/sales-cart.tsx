import { Link, useNavigate } from "react-router"
import { ShoppingCart } from "lucide-react"

import { PageError, PageLoading } from "@/components/common/query-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/features/products/hooks/use-products"
import { OrderLinesTable } from "@/features/sales/components/order-lines-table"
import { subtotalOf } from "@/features/sales/lib/order-totals"
import { cartItemCount, useCartStore } from "@/features/sales/store/cart-store"
import { formatVnd } from "@/lib/format"

export function SalesCartPage() {
  const navigate = useNavigate()
  const products = useProducts()
  const cart = useCartStore((s) => s.cart)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeLine = useCartStore((s) => s.removeLine)
  const clear = useCartStore((s) => s.clear)

  if (products.isPending) return <PageLoading />
  if (products.error)
    return (
      <PageError
        error={products.error}
        onRetry={() => void products.refetch()}
      />
    )

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link to="/sales" className="hover:text-primary">
            ‹ Tiếp tục chọn hàng
          </Link>
        }
        title="Giỏ hàng"
        description="Kiểm tra sản phẩm rồi tiến hành đặt hàng."
      />
      {cart.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border bg-card px-5 py-14 text-center text-[13px] text-muted-foreground">
          <span className="mb-1.5 grid size-[52px] place-items-center rounded-full bg-muted">
            <ShoppingCart className="size-6" aria-hidden="true" />
          </span>
          <b className="text-[14.5px] text-foreground">Giỏ hàng đang trống</b>
          Quay lại danh sách để chọn sản phẩm.
          <Button size="lg" className="mt-2.5" asChild>
            <Link to="/sales">Chọn sản phẩm</Link>
          </Button>
        </div>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-2xl border bg-card">
            <OrderLinesTable
              lines={cart}
              products={products.data}
              onQuantityChange={(id, q) => setQuantity("cart", id, q)}
              onRemove={(id) => removeLine("cart", id)}
            />
            <div className="flex items-center justify-between border-t px-4 py-3 text-[13px] text-muted-foreground">
              {cartItemCount(cart)} sản phẩm trong giỏ
              <button
                type="button"
                onClick={() => clear("cart")}
                className="font-semibold text-danger hover:underline"
              >
                Xoá toàn bộ giỏ
              </button>
            </div>
          </section>
          <aside className="rounded-2xl border bg-card p-5 xl:sticky xl:top-[84px]">
            <h2 className="mb-3 text-base font-bold">Tóm tắt</h2>
            <div className="flex items-baseline justify-between border-t border-dashed pt-3">
              <span className="font-semibold">Tạm tính</span>
              <b className="text-2xl font-bold tracking-tight tabular-nums">
                {formatVnd(subtotalOf(cart))}
              </b>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Phí vận chuyển và điểm Mi tính ở bước đặt hàng.
            </p>
            <Button
              size="lg"
              className="mt-4 h-[50px] w-full text-[15px]"
              onClick={() => navigate("/sales/checkout")}
            >
              Tiến hành đặt hàng
            </Button>
          </aside>
        </div>
      )}
    </>
  )
}
