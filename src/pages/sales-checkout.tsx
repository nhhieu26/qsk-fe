import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router"

import { PageError, PageLoading } from "@/components/common/query-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import type { Customer } from "@/features/customers/types"
import { useProducts } from "@/features/products/hooks/use-products"
import type { Product } from "@/features/products/types"
import { CheckoutLineList } from "@/features/sales/components/checkout/checkout-line-list"
import { ProductPicker } from "@/features/sales/components/checkout/product-picker"
import { CustomerSection } from "@/features/sales/components/checkout/customer-section"
import { DeliverySection } from "@/features/sales/components/checkout/delivery-section"
import { InvoiceSection } from "@/features/sales/components/checkout/invoice-section"
import { PaymentSection } from "@/features/sales/components/checkout/payment-section"
import { OrderTotalsSummary } from "@/features/sales/components/order-totals-summary"
import { useCreateOrder } from "@/features/sales/hooks/use-orders"
import {
  checkoutSchema,
  EMPTY_CHECKOUT,
  toCreateOrderInput,
  type CheckoutFormInput,
  type CheckoutFormValues,
} from "@/features/sales/lib/checkout-schema"
import {
  useCheckoutShipping,
  type CheckoutShipping,
} from "@/features/sales/hooks/use-checkout-shipping"
import { calculateTotals, subtotalOf } from "@/features/sales/lib/order-totals"
import {
  useCartStore,
  type CheckoutSource,
} from "@/features/sales/store/cart-store"
import { notifyError, notifySuccess, notifyWarning } from "@/lib/notify"

export function SalesCheckoutPage() {
  const [searchParams] = useSearchParams()
  const source: CheckoutSource =
    searchParams.get("from") === "buy-now" ? "buyNow" : "cart"
  const products = useProducts()

  if (products.isPending) return <PageLoading />
  if (products.error)
    return (
      <PageError
        error={products.error}
        onRetry={() => void products.refetch()}
      />
    )

  const backLink =
    source === "cart"
      ? { to: "/sales/cart", label: "‹ Về giỏ hàng" }
      : { to: "/sales", label: "‹ Tiếp tục chọn hàng" }

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link to={backLink.to} className="hover:text-primary">
            {backLink.label}
          </Link>
        }
        title="Đặt hàng"
        description={
          source === "buyNow"
            ? "Mua ngay, không ảnh hưởng giỏ hàng."
            : "Đặt toàn bộ sản phẩm trong giỏ."
        }
      />
      <CheckoutForm source={source} products={products.data} />
    </>
  )
}

/** Trạng thái báo phí Viettel Post dưới phần tổng tiền. */
function ShippingFeeNote({ shipping }: { shipping: CheckoutShipping }) {
  if (shipping.status === "ready") return null
  const message = {
    needsAddress:
      "Phí ship đang tạm tính. Chọn đủ tỉnh/thành, phường/xã, số nhà để lấy giá Viettel Post.",
    loading: "Đang lấy giá Viettel Post…",
    error: `Không lấy được giá Viettel Post: ${
      shipping.status === "error" && shipping.error instanceof Error
        ? shipping.error.message
        : "thử lại sau"
    }`,
  }[shipping.status]
  return (
    <p
      role={shipping.status === "error" ? "alert" : "status"}
      className={
        shipping.status === "error"
          ? "text-[12.5px] text-destructive"
          : "text-[12.5px] text-muted-foreground"
      }
    >
      {message}
    </p>
  )
}

function CheckoutForm({
  source,
  products,
}: {
  source: CheckoutSource
  products: readonly Product[]
}) {
  const navigate = useNavigate()
  const lines = useCartStore((s) => s[source])
  const addLine = useCartStore((s) => s.addLine)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeLine = useCartStore((s) => s.removeLine)
  const clear = useCartStore((s) => s.clear)
  const createOrder = useCreateOrder()
  const [customer, setCustomer] = useState<Customer>()

  const form = useForm<CheckoutFormInput, unknown, CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: EMPTY_CHECKOUT,
  })
  const [shippingMethod, pointsUsed] = useWatch({
    control: form.control,
    name: ["shipping.method", "payment.pointsUsed"],
  })

  const shipping = useCheckoutShipping(form.control, lines, subtotalOf(lines))
  const totals = calculateTotals({
    lines,
    shippingMethod,
    pointsUsed: Number(pointsUsed) || 0,
    availablePoints: customer?.points ?? 0,
    // Viettel: phí thật đã báo; chưa báo xong thì hiện phí tạm tính và khoá nút đặt.
    shippingFee: shipping.status === "ready" ? shipping.fee : shipping.estimate,
  })

  const selectCustomer = (next: Customer | undefined) => {
    setCustomer(next)
    form.setValue("customer.id", next?.id)
    form.setValue("payment.pointsUsed", 0)
    if (!next) return
    const opts = { shouldValidate: true }
    form.setValue("customer.name", next.name, opts)
    form.setValue("customer.phone", next.phone, opts)
    form.setValue("customer.email", next.email ?? "", opts)
    const [address] = next.addresses
    if (address) {
      form.setValue("shipping.province", address.province)
      form.setValue("shipping.provinceId", address.provinceId)
      form.setValue("shipping.ward", address.ward)
      form.setValue("shipping.wardId", address.wardId)
      form.setValue("shipping.street", address.street)
    }
    if (next.lastInvoice) {
      form.setValue("invoice.buyerType", next.lastInvoice.buyerType)
      form.setValue("invoice.buyerName", next.lastInvoice.buyerName)
      form.setValue("invoice.taxCode", next.lastInvoice.taxCode ?? "")
      form.setValue("invoice.address", next.lastInvoice.address)
      form.setValue("invoice.email", next.lastInvoice.email)
    }
  }

  const handleAdd = (p: Product) => {
    if (!addLine(source, { id: p.id, name: p.name, price: p.price }, p.stock)) {
      notifyWarning(`${p.name} không đủ tồn kho`)
    }
  }

  const onSubmit = (values: CheckoutFormValues) => {
    if (lines.length === 0) {
      notifyError(undefined, "Đơn chưa có sản phẩm nào")
      return
    }
    const input = toCreateOrderInput(
      {
        ...values,
        payment: { ...values.payment, pointsUsed: totals.pointsDiscount },
      },
      lines,
      totals.total
    )
    createOrder.mutate(input, {
      onSuccess: (order) => {
        clear(source)
        notifySuccess(`Đã tạo đơn ${order.code}`)
        navigate(`/orders/${order.id}`, { replace: true })
      },
      onError: (error) => notifyError(error),
    })
  }

  const onInvalid = () =>
    notifyError(undefined, "Còn thông tin chưa đúng, kiểm tra các ô báo đỏ")

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_400px]"
      >
        <div className="grid min-w-0 gap-5">
          <CustomerSection selected={customer} onSelect={selectCustomer} />
          <DeliverySection
            subtotal={totals.subtotal}
            customer={customer}
            viettelFee={shipping.status === "ready" ? shipping.fee : undefined}
          />
          <PaymentSection subtotal={totals.subtotal} customer={customer} />
          <InvoiceSection />
        </div>
        <aside className="grid gap-4 rounded-2xl border bg-card p-5 xl:sticky xl:top-[84px]">
          <h2 className="text-base font-bold">
            Đơn hàng · {lines.length} sản phẩm
          </h2>
          <ProductPicker products={products} lines={lines} onAdd={handleAdd} />
          <div className="border-y">
            {lines.length > 0 ? (
              <CheckoutLineList
                lines={lines}
                products={products}
                onQuantityChange={(id, q) => setQuantity(source, id, q)}
                onRemove={(id) => removeLine(source, id)}
              />
            ) : (
              <p className="py-6 text-center text-[13px] text-muted-foreground">
                Chưa có sản phẩm. Tìm ở ô phía trên để thêm vào đơn.
              </p>
            )}
          </div>
          <OrderTotalsSummary
            totals={totals}
            showEarnedPoints={customer !== undefined}
          />
          <ShippingFeeNote shipping={shipping} />
          <Button
            type="submit"
            size="lg"
            className="h-[50px] w-full text-[15px] tracking-wide"
            disabled={
              createOrder.isPending ||
              lines.length === 0 ||
              shipping.status === "loading" ||
              shipping.status === "error"
            }
          >
            {createOrder.isPending ? "Đang tạo đơn…" : "ĐẶT HÀNG"}
          </Button>
        </aside>
      </form>
    </FormProvider>
  )
}
