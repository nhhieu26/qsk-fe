import { useFormContext, useWatch } from "react-hook-form"
import { Banknote, HandCoins, QrCode } from "lucide-react"

import { FormField } from "@/components/common/form-field"
import { OptionCards, type OptionCard } from "@/components/common/option-cards"
import { Input } from "@/components/ui/input"
import type { Customer } from "@/features/customers/types"
import { CheckoutSection } from "@/features/sales/components/checkout/checkout-section"
import { PAYMENT_METHODS, SHIPPING_METHODS } from "@/features/sales/constants"
import type { CheckoutFormInput } from "@/features/sales/lib/checkout-schema"
import { maxUsablePoints } from "@/features/sales/lib/order-totals"
import type { PaymentMethod } from "@/features/sales/types"
import { formatNumber } from "@/lib/format"

const ICONS = { cash: Banknote, transfer: QrCode, cod: HandCoins } as const

type PaymentSectionProps = {
  subtotal: number
  customer: Customer | undefined
}

export function PaymentSection({ subtotal, customer }: PaymentSectionProps) {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<CheckoutFormInput>()
  const [method, shippingMethod] = useWatch({
    control,
    name: ["payment.method", "shipping.method"],
  })
  const e = errors.payment
  const isDelivery = SHIPPING_METHODS[shippingMethod].requiresAddress
  const maxPoints = customer ? maxUsablePoints(customer.points, subtotal) : 0

  const options: OptionCard<PaymentMethod>[] = (
    Object.keys(PAYMENT_METHODS) as PaymentMethod[]
  ).map((key) => ({
    value: key,
    label: PAYMENT_METHODS[key].label,
    description: PAYMENT_METHODS[key].description,
    icon: ICONS[key],
    disabled: PAYMENT_METHODS[key].requiresDelivery && !isDelivery,
    disabledReason: "Chỉ khi giao hàng",
  }))

  const changeMethod = (next: PaymentMethod) => {
    setValue("payment.method", next, { shouldValidate: true })
    // Chỉ tiền mặt được đánh dấu thu ngay; chuyển khoản luôn chờ đối soát ở trang đơn.
    setValue("payment.collectedNow", next === "cash")
  }

  return (
    <CheckoutSection step={3} title="Thanh toán">
      <OptionCards
        name="payment-method"
        label="Phương thức thanh toán"
        options={options}
        value={method}
        onChange={changeMethod}
      />
      {e?.method && (
        <p className="text-xs text-destructive">{e.method.message}</p>
      )}
      {method === "cash" && (
        <label className="flex items-center gap-2 text-[13.5px] font-medium">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            {...register("payment.collectedNow")}
          />
          Đã thu đủ tiền mặt
        </label>
      )}
      {method === "transfer" && (
        <p className="text-[12.5px] text-muted-foreground">
          Sau khi đặt, gửi mã QR cho khách ở trang chi tiết đơn. Nhận được tiền
          thì bấm &ldquo;Xác nhận đã thu tiền&rdquo; tại đó.
        </p>
      )}
      {maxPoints > 0 && (
        <FormField
          label={`Dùng điểm Mi (đang có ${formatNumber(customer?.points ?? 0)}, dùng tối đa ${formatNumber(maxPoints)})`}
          htmlFor="p-points"
          error={e?.pointsUsed?.message}
          className="sm:max-w-xs"
        >
          <Input
            id="p-points"
            type="number"
            min={0}
            max={maxPoints}
            step={1000}
            {...register("payment.pointsUsed")}
          />
        </FormField>
      )}
      <FormField label="Ghi chú đơn hàng" htmlFor="o-note">
        <Input
          id="o-note"
          placeholder="Ghi chú nội bộ cho đơn"
          {...register("note")}
        />
      </FormField>
    </CheckoutSection>
  )
}
