import { useState } from "react"
import { X } from "lucide-react"

import { SearchInput } from "@/components/common/search-input"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SHIPPING_METHODS,
} from "@/features/sales/constants"
import {
  hasActiveFilters,
  type OrderListParams,
} from "@/features/sales/lib/order-list-params"

type OrderFilterBarProps = {
  params: OrderListParams
  /** Ô tìm kiếm gõ đến đâu đổi đến đó; trang tự debounce trước khi gọi API. */
  onChange: (patch: Partial<OrderListParams>) => void
}

type SelectFilterProps<T extends string> = {
  id: string
  label: string
  value: T | undefined
  options: Record<T, { label: string }>
  onChange: (value: T | undefined) => void
}

function SelectFilter<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: SelectFilterProps<T>) {
  return (
    <NativeSelect
      id={id}
      aria-label={label}
      className="w-full sm:w-auto"
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? undefined : (e.target.value as T))
      }
    >
      <NativeSelectOption value="">{label}: tất cả</NativeSelectOption>
      {(Object.keys(options) as T[]).map((key) => (
        <NativeSelectOption key={key} value={key}>
          {options[key].label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

export function OrderFilterBar({ params, onChange }: OrderFilterBarProps) {
  // Giữ chữ đang gõ ở local để ô không bị giật khi URL cập nhật.
  const [text, setText] = useState(params.q ?? "")

  const changeText = (value: string) => {
    setText(value)
    onChange({ q: value })
  }

  const clearAll = () => {
    setText("")
    onChange({
      q: undefined,
      from: undefined,
      to: undefined,
      paymentStatus: undefined,
      paymentMethod: undefined,
      shippingMethod: undefined,
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 px-[18px] py-3.5">
      <SearchInput
        value={text}
        onChange={changeText}
        placeholder="Mã đơn, tên hoặc SĐT khách"
        className="h-[42px] min-w-[220px] flex-[1_1_260px]"
      />
      <label className="flex items-center gap-1.5 text-[12.5px] font-semibold text-secondary-foreground">
        Ngày đặt
        <Input
          type="date"
          aria-label="Từ ngày"
          className="w-[150px]"
          value={params.from ?? ""}
          max={params.to}
          onChange={(e) => onChange({ from: e.target.value || undefined })}
        />
      </label>
      <span className="text-muted-foreground">–</span>
      <Input
        type="date"
        aria-label="Đến ngày"
        className="w-[150px]"
        value={params.to ?? ""}
        min={params.from}
        onChange={(e) => onChange({ to: e.target.value || undefined })}
      />
      <SelectFilter
        id="f-payment-status"
        label="Thanh toán"
        value={params.paymentStatus}
        options={PAYMENT_STATUSES}
        onChange={(paymentStatus) => onChange({ paymentStatus })}
      />
      <SelectFilter
        id="f-payment-method"
        label="Hình thức trả"
        value={params.paymentMethod}
        options={PAYMENT_METHODS}
        onChange={(paymentMethod) => onChange({ paymentMethod })}
      />
      <SelectFilter
        id="f-shipping"
        label="Vận chuyển"
        value={params.shippingMethod}
        options={SHIPPING_METHODS}
        onChange={(shippingMethod) => onChange({ shippingMethod })}
      />
      {hasActiveFilters(params) && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex h-[42px] items-center gap-1 rounded-[10px] px-3 text-[13px] font-semibold text-primary hover:bg-primary-soft"
        >
          <X className="size-4" aria-hidden="true" /> Xoá lọc
        </button>
      )}
    </div>
  )
}
