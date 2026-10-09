import { useFormContext, useWatch } from "react-hook-form"
import { Store, Truck, Zap } from "lucide-react"

import { FormField } from "@/components/common/form-field"
import { OptionCards, type OptionCard } from "@/components/common/option-cards"
import { Input } from "@/components/ui/input"
import { formatAddress } from "@/features/customers/lib/customer-validation"
import type { Address, Customer } from "@/features/customers/types"
import { AddressFields } from "@/features/sales/components/checkout/address-fields"
import { CheckoutSection } from "@/features/sales/components/checkout/checkout-section"
import { SHIPPING_METHODS, STORE_PROVINCE } from "@/features/sales/constants"
import type { CheckoutFormInput } from "@/features/sales/lib/checkout-schema"
import {
  isShippingAvailable,
  shippingFee,
} from "@/features/sales/lib/order-totals"
import type { ShippingMethod } from "@/features/sales/types"
import { formatVnd } from "@/lib/format"

const ICONS = { pickup: Store, viettel: Truck, express: Zap } as const

type DeliverySectionProps = {
  subtotal: number
  customer: Customer | undefined
  /** Phí ViettelPost vừa báo cho địa chỉ hiện tại (khi đang chọn Viettel). */
  viettelFee?: number
}

/** Nhãn phí trên thẻ phương thức: Viettel là phí thật, cần địa chỉ mới báo được. */
function feeLabel(
  method: ShippingMethod,
  subtotal: number,
  viettelFee: number | undefined
): string | undefined {
  if (method === "pickup") return undefined
  const tableFee = shippingFee(method, subtotal)
  if (tableFee === 0) return "Miễn phí"
  if (method !== "viettel") return formatVnd(tableFee)
  return viettelFee === undefined ? "Theo địa chỉ" : formatVnd(viettelFee)
}

export function DeliverySection({
  subtotal,
  customer,
  viettelFee,
}: DeliverySectionProps) {
  const {
    register,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useFormContext<CheckoutFormInput>()
  const [method, recipientIsCustomer, province] = useWatch({
    control,
    name: [
      "shipping.method",
      "shipping.recipientIsCustomer",
      "shipping.province",
    ],
  })
  const e = errors.shipping
  const needsAddress = SHIPPING_METHODS[method].requiresAddress

  const options: OptionCard<ShippingMethod>[] = (
    Object.keys(SHIPPING_METHODS) as ShippingMethod[]
  ).map((key) => {
    const available = isShippingAvailable(key, province)
    return {
      value: key,
      label: SHIPPING_METHODS[key].label,
      description: SHIPPING_METHODS[key].description,
      icon: ICONS[key],
      aside: feeLabel(key, subtotal, key === method ? viettelFee : undefined),
      disabled: !available,
      disabledReason: `Chỉ giao trong ${STORE_PROVINCE}`,
    }
  })

  const changeMethod = (next: ShippingMethod) => {
    setValue("shipping.method", next, { shouldValidate: false })
    // Thu hộ chỉ có khi giao hàng.
    if (next === "pickup" && getValues("payment.method") === "cod")
      setValue("payment.method", "cash")
  }

  const applyAddress = (address: Address) => {
    setValue("shipping.province", address.province, { shouldValidate: true })
    setValue("shipping.provinceId", address.provinceId)
    setValue("shipping.ward", address.ward, { shouldValidate: true })
    setValue("shipping.wardId", address.wardId)
    setValue("shipping.street", address.street, { shouldValidate: true })
  }

  return (
    <CheckoutSection
      step={2}
      title="Nhận hàng"
      description="Chọn đơn vị vận chuyển hoặc khách lấy tại quầy."
    >
      <OptionCards
        name="shipping-method"
        label="Hình thức nhận hàng"
        options={options}
        value={method}
        onChange={changeMethod}
      />
      {e?.method && (
        <p className="text-xs text-destructive">{e.method.message}</p>
      )}

      {needsAddress && (
        <>
          <label className="flex items-center gap-2 text-[13.5px] font-medium">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              {...register("shipping.recipientIsCustomer")}
            />
            Người nhận là người đặt hàng
          </label>
          {!recipientIsCustomer && (
            <div className="grid gap-3.5 sm:grid-cols-2">
              <FormField
                label="Tên người nhận *"
                htmlFor="s-name"
                error={e?.recipientName?.message}
              >
                <Input
                  id="s-name"
                  aria-invalid={!!e?.recipientName}
                  {...register("shipping.recipientName")}
                />
              </FormField>
              <FormField
                label="SĐT người nhận *"
                htmlFor="s-phone"
                error={e?.recipientPhone?.message}
              >
                <Input
                  id="s-phone"
                  type="tel"
                  inputMode="tel"
                  aria-invalid={!!e?.recipientPhone}
                  {...register("shipping.recipientPhone")}
                />
              </FormField>
            </div>
          )}

          {customer && customer.addresses.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="w-full text-[12.5px] font-semibold text-secondary-foreground">
                Địa chỉ đã dùng
              </span>
              {customer.addresses.map((a) => (
                <button
                  key={formatAddress(a)}
                  type="button"
                  onClick={() => applyAddress(a)}
                  className="rounded-full border px-3 py-1.5 text-left text-[12.5px] hover:border-primary hover:text-primary"
                >
                  {formatAddress(a)}
                </button>
              ))}
            </div>
          )}

          <AddressFields />
          <FormField label="Ghi chú giao hàng" htmlFor="s-note">
            <Input
              id="s-note"
              placeholder="Giờ nhận, gọi trước khi giao..."
              {...register("shipping.note")}
            />
          </FormField>
        </>
      )}
    </CheckoutSection>
  )
}
