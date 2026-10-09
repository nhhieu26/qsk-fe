import { useFormContext, useWatch } from "react-hook-form"

import { FormField } from "@/components/common/form-field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { CheckoutFormInput } from "@/features/sales/lib/checkout-schema"
import { isSameProvince } from "@/features/sales/lib/order-totals"
import { useProvinces, useWards } from "@/features/shipping/hooks/use-shipping"

/**
 * Tỉnh/thành → phường/xã theo danh mục ViettelPost (2 cấp, từ 01/07/2025).
 * Giá trị option là TÊN (để địa chỉ cũ chỉ có tên vẫn chọn đúng), id lưu kèm.
 */
export function AddressFields() {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<CheckoutFormInput>()
  const [province, ward, provinceId] = useWatch({
    control,
    name: ["shipping.province", "shipping.ward", "shipping.provinceId"],
  })
  const provinces = useProvinces()
  // Địa chỉ cũ có thể ghi "Hà Nội" thay vì "Thành phố Hà Nội": so bỏ tiền tố.
  const matchedProvince = provinces.data?.find(
    (p) => p.id === provinceId || isSameProvince(p.name, province)
  )
  const selectedProvinceId = matchedProvince?.id
  const wards = useWards(selectedProvinceId)
  const e = errors.shipping

  const changeProvince = (name: string) => {
    const next = provinces.data?.find((p) => p.name === name)
    setValue("shipping.province", name, { shouldValidate: true })
    setValue("shipping.provinceId", next?.id)
    setValue("shipping.ward", "")
    setValue("shipping.wardId", undefined)
  }

  const changeWard = (name: string) => {
    const next = wards.data?.find((w) => w.name === name)
    setValue("shipping.ward", name, { shouldValidate: true })
    setValue("shipping.wardId", next?.id)
  }

  const wardInList =
    ward === "" || wards.data?.some((w) => w.name === ward) === true
  const wardPlaceholder =
    selectedProvinceId === undefined
      ? "Chọn tỉnh/thành trước"
      : wards.isPending
        ? "Đang tải phường/xã…"
        : "Chọn phường/xã"

  return (
    <>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <FormField
          label="Tỉnh / Thành phố *"
          htmlFor="s-province"
          error={
            e?.province?.message ??
            (provinces.error ? "Không tải được danh mục tỉnh/thành" : undefined)
          }
        >
          <NativeSelect
            id="s-province"
            className="w-full"
            aria-invalid={!!e?.province}
            value={matchedProvince?.name ?? ""}
            disabled={provinces.isPending}
            onChange={(ev) => changeProvince(ev.target.value)}
          >
            <NativeSelectOption value="">
              {provinces.isPending ? "Đang tải…" : "Chọn tỉnh/thành"}
            </NativeSelectOption>
            {provinces.data?.map((p) => (
              <NativeSelectOption key={p.id} value={p.name}>
                {p.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FormField>
        <FormField
          label="Phường / Xã *"
          htmlFor="s-ward"
          error={
            e?.ward?.message ??
            (wards.error ? "Không tải được danh mục phường/xã" : undefined)
          }
        >
          <NativeSelect
            id="s-ward"
            className="w-full"
            aria-invalid={!!e?.ward}
            value={ward}
            disabled={selectedProvinceId === undefined || wards.isPending}
            onChange={(ev) => changeWard(ev.target.value)}
          >
            <NativeSelectOption value="">{wardPlaceholder}</NativeSelectOption>
            {/* Địa chỉ cũ có phường không còn trong danh mục: vẫn hiện để không mất. */}
            {!wardInList && (
              <NativeSelectOption value={ward}>{ward}</NativeSelectOption>
            )}
            {wards.data?.map((w) => (
              <NativeSelectOption key={w.id} value={w.name}>
                {w.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FormField>
      </div>
      <FormField
        label="Số nhà, tên đường *"
        htmlFor="s-street"
        error={e?.street?.message}
      >
        <Input
          id="s-street"
          autoComplete="street-address"
          placeholder="12 Quang Trung"
          aria-invalid={!!e?.street}
          {...register("shipping.street")}
        />
      </FormField>
    </>
  )
}
