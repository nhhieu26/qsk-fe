import { useFormContext, useWatch } from "react-hook-form"

import { FormField } from "@/components/common/form-field"
import { SegmentedControl } from "@/components/common/segmented-control"
import { Input } from "@/components/ui/input"
import { formatAddress } from "@/features/customers/lib/customer-validation"
import type { InvoiceBuyerType } from "@/features/customers/types"
import { CheckoutSection } from "@/features/sales/components/checkout/checkout-section"
import type { CheckoutFormInput } from "@/features/sales/lib/checkout-schema"

const BUYER_TYPES: readonly { value: InvoiceBuyerType; label: string }[] = [
  { value: "personal", label: "Cá nhân" },
  { value: "company", label: "Công ty / Hộ kinh doanh" },
]

export function InvoiceSection() {
  const {
    register,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useFormContext<CheckoutFormInput>()
  const [isRequired, buyerType] = useWatch({
    control,
    name: ["invoice.required", "invoice.buyerType"],
  })
  const e = errors.invoice
  const isCompany = buyerType === "company"

  /** Điền nhanh từ thông tin người đặt + địa chỉ giao. */
  const copyFromCustomer = () => {
    const v = getValues()
    const address = formatAddress({
      province: v.shipping.province,
      ward: v.shipping.ward,
      street: v.shipping.street,
    })
    if (!isCompany)
      setValue("invoice.buyerName", v.customer.name, { shouldValidate: true })
    if (address !== "")
      setValue("invoice.address", address, { shouldValidate: true })
    if (v.customer.email !== "")
      setValue("invoice.email", v.customer.email, { shouldValidate: true })
  }

  return (
    <CheckoutSection
      step={4}
      title="Xuất hoá đơn"
      description="Hoá đơn điện tử gửi qua email."
      actions={
        <label className="flex items-center gap-2 text-[13.5px] font-medium whitespace-nowrap">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            {...register("invoice.required")}
          />
          Khách cần hoá đơn
        </label>
      }
    >
      {isRequired ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedControl
              options={BUYER_TYPES}
              value={buyerType}
              onChange={(v) =>
                setValue("invoice.buyerType", v, { shouldValidate: true })
              }
            />
            <button
              type="button"
              onClick={copyFromCustomer}
              className="text-[12.5px] font-semibold text-primary hover:underline"
            >
              Lấy thông tin người đặt
            </button>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <FormField
              label={isCompany ? "Tên đơn vị *" : "Tên người mua *"}
              htmlFor="i-name"
              error={e?.buyerName?.message}
            >
              <Input
                id="i-name"
                aria-invalid={!!e?.buyerName}
                {...register("invoice.buyerName")}
              />
            </FormField>
            <FormField
              label={isCompany ? "Mã số thuế *" : "Mã số thuế (nếu có)"}
              htmlFor="i-tax"
              error={e?.taxCode?.message}
            >
              <Input
                id="i-tax"
                inputMode="numeric"
                placeholder="0101234567"
                aria-invalid={!!e?.taxCode}
                {...register("invoice.taxCode")}
              />
            </FormField>
          </div>
          <FormField
            label="Địa chỉ xuất hoá đơn *"
            htmlFor="i-address"
            error={e?.address?.message}
          >
            <Input
              id="i-address"
              placeholder="Theo đăng ký kinh doanh / CCCD"
              aria-invalid={!!e?.address}
              {...register("invoice.address")}
            />
          </FormField>
          <FormField
            label="Email nhận hoá đơn *"
            htmlFor="i-email"
            error={e?.email?.message}
          >
            <Input
              id="i-email"
              type="email"
              aria-invalid={!!e?.email}
              {...register("invoice.email")}
            />
          </FormField>
        </>
      ) : (
        <p className="text-[13px] text-muted-foreground">
          Không xuất hoá đơn cho đơn này.
        </p>
      )}
    </CheckoutSection>
  )
}
