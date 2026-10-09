import { useFormContext } from "react-hook-form"

import { FormField } from "@/components/common/form-field"
import { UserAvatar } from "@/components/common/user-avatar"
import { Input } from "@/components/ui/input"
import { normalizePhone } from "@/features/customers/lib/customer-validation"
import type { Customer } from "@/features/customers/types"
import { CheckoutSection } from "@/features/sales/components/checkout/checkout-section"
import { CustomerSearch } from "@/features/sales/components/checkout/customer-search"
import type { CheckoutFormInput } from "@/features/sales/lib/checkout-schema"
import { formatNumber } from "@/lib/format"

type CustomerSectionProps = {
  selected: Customer | undefined
  onSelect: (customer: Customer | undefined) => void
}

export function CustomerSection({ selected, onSelect }: CustomerSectionProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormInput>()
  const e = errors.customer

  // Sửa SĐT khác khách đã chọn thì coi là khách mới, bỏ liên kết hội viên/điểm.
  const phoneField = register("customer.phone", {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (selected && normalizePhone(event.target.value) !== selected.phone)
        onSelect(undefined)
    },
  })

  return (
    <CheckoutSection
      step={1}
      title="Người đặt hàng"
      description="Chọn khách cũ để tự điền, hoặc nhập khách mới."
    >
      {selected ? (
        <div className="flex items-center gap-3 rounded-xl border px-3.5 py-3">
          <UserAvatar name={selected.name} />
          <div className="min-w-0 flex-1">
            <b className="block text-sm font-semibold">{selected.name}</b>
            <span className="text-[12.5px] text-muted-foreground">
              {selected.memberCode ? `${selected.memberCode} · ` : ""}
              {formatNumber(selected.points)} điểm Mi
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelect(undefined)}
            className="text-[12.5px] font-semibold text-primary"
          >
            Bỏ chọn
          </button>
        </div>
      ) : (
        <CustomerSearch onSelect={onSelect} />
      )}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <FormField
          label="Họ tên người đặt *"
          htmlFor="c-name"
          error={e?.name?.message}
        >
          <Input
            id="c-name"
            autoComplete="name"
            aria-invalid={!!e?.name}
            {...register("customer.name")}
          />
        </FormField>
        <FormField
          label="Số điện thoại *"
          htmlFor="c-phone"
          error={e?.phone?.message}
        >
          <Input
            id="c-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="09xx xxx xxx"
            aria-invalid={!!e?.phone}
            {...phoneField}
          />
        </FormField>
      </div>
      <FormField
        label="Email (để gửi xác nhận đơn)"
        htmlFor="c-email"
        error={e?.email?.message}
      >
        <Input
          id="c-email"
          type="email"
          autoComplete="email"
          aria-invalid={!!e?.email}
          {...register("customer.email")}
        />
      </FormField>
    </CheckoutSection>
  )
}
