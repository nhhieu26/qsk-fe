import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormField } from "@/components/common/form-field"
import { SectionCard } from "@/components/common/section-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUpdateStore } from "@/features/settings/hooks/use-settings"
import {
  STORE_CODE_MAX,
  storeSchema,
  type StoreFormInput,
  type StoreFormValues,
} from "@/features/settings/lib/settings-schema"
import type { StoreInfo } from "@/features/settings/types"
import { notifyError, notifySuccess } from "@/lib/notify"

type StoreInfoCardProps = {
  store: StoreInfo
  canEdit: boolean
}

export function StoreInfoCard({ store, canEdit }: StoreInfoCardProps) {
  const update = useUpdateStore()
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<StoreFormInput, unknown, StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: store,
  })

  const submit = (values: StoreFormValues) =>
    update.mutate(values, {
      onSuccess: (settings) => {
        reset(settings.store)
        notifySuccess("Đã lưu thông tin điểm")
      },
      onError: (error) => notifyError(error),
    })

  return (
    <SectionCard title="Thông tin điểm">
      <form noValidate onSubmit={handleSubmit(submit)} className="grid gap-3.5">
        <fieldset disabled={!canEdit} className="grid gap-3.5 sm:grid-cols-2">
          <FormField
            label="Tên điểm"
            htmlFor="s-name"
            error={errors.name?.message}
          >
            <Input
              id="s-name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
          </FormField>
          <FormField
            label="Điện thoại quầy"
            htmlFor="s-phone"
            error={errors.phone?.message}
          >
            <Input
              id="s-phone"
              inputMode="tel"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
          </FormField>
          <FormField
            label="Mã điểm, đầu mã hội viên"
            htmlFor="s-code"
            error={errors.code?.message}
          >
            <Input
              id="s-code"
              maxLength={STORE_CODE_MAX}
              className="uppercase"
              aria-invalid={!!errors.code}
              {...register("code")}
            />
          </FormField>
          <FormField
            label="Địa chỉ"
            htmlFor="s-address"
            className="sm:col-span-2"
          >
            <Input id="s-address" {...register("address")} />
          </FormField>
        </fieldset>
        {canEdit && (
          <div>
            <Button type="submit" disabled={!isDirty || update.isPending}>
              {update.isPending ? "Đang lưu…" : "Lưu thông tin"}
            </Button>
          </div>
        )}
      </form>
    </SectionCard>
  )
}
