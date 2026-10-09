import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { QRCodeSVG } from "qrcode.react"
import { useForm } from "react-hook-form"

import { AlertBanner } from "@/components/common/alert-banner"
import { FormField } from "@/components/common/form-field"
import { SectionCard } from "@/components/common/section-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { BANKS } from "@/features/sales/constants"
import { buildVietQrPayload } from "@/features/sales/lib/vietqr"
import { useUpdatePaymentAccount } from "@/features/settings/hooks/use-settings"
import {
  paymentAccountSchema,
  TEST_QR,
  type PaymentAccountFormInput,
  type PaymentAccountFormValues,
} from "@/features/settings/lib/settings-schema"
import type { PaymentAccount } from "@/features/settings/types"
import { formatDate, formatTime, formatVnd } from "@/lib/format"
import { notifyError, notifySuccess } from "@/lib/notify"

const QR_SIZE = 168

type PaymentAccountCardProps = {
  account?: PaymentAccount
  canEdit: boolean
}

function toDefaults(account?: PaymentAccount): PaymentAccountFormInput {
  return {
    bankBin: account?.bankBin ?? "",
    accountNumber: account?.accountNumber ?? "",
    accountName: account?.accountName ?? "",
  }
}

export function PaymentAccountCard({
  account,
  canEdit,
}: PaymentAccountCardProps) {
  const update = useUpdatePaymentAccount()
  const [showTestQr, setShowTestQr] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PaymentAccountFormInput, unknown, PaymentAccountFormValues>({
    resolver: zodResolver(paymentAccountSchema),
    defaultValues: toDefaults(account),
  })

  const submit = (values: PaymentAccountFormValues) =>
    update.mutate(values, {
      onSuccess: (settings) => {
        reset(toDefaults(settings.paymentAccount))
        setShowTestQr(false)
        notifySuccess("Đã lưu tài khoản nhận tiền")
      },
      onError: (error) => notifyError(error),
    })

  return (
    <SectionCard title="Tài khoản nhận thanh toán">
      {!account && (
        <AlertBanner title="Chưa cài tài khoản nhận thanh toán.">
          Đơn chuyển khoản chưa tạo được mã QR cho khách.
        </AlertBanner>
      )}
      <form noValidate onSubmit={handleSubmit(submit)} className="grid gap-3.5">
        <fieldset disabled={!canEdit} className="grid gap-3.5 sm:grid-cols-2">
          <FormField
            label="Ngân hàng"
            htmlFor="pa-bank"
            error={errors.bankBin?.message}
          >
            <NativeSelect
              id="pa-bank"
              className="w-full"
              aria-invalid={!!errors.bankBin}
              {...register("bankBin")}
            >
              <NativeSelectOption value="">Chọn ngân hàng</NativeSelectOption>
              {BANKS.map((b) => (
                <NativeSelectOption key={b.bin} value={b.bin}>
                  {b.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FormField>
          <FormField
            label="Số tài khoản"
            htmlFor="pa-number"
            error={errors.accountNumber?.message}
          >
            <Input
              id="pa-number"
              inputMode="numeric"
              aria-invalid={!!errors.accountNumber}
              {...register("accountNumber")}
            />
          </FormField>
          <FormField
            label="Chủ tài khoản"
            htmlFor="pa-name"
            error={errors.accountName?.message}
            className="sm:col-span-2"
          >
            <Input
              id="pa-name"
              className="uppercase"
              aria-invalid={!!errors.accountName}
              {...register("accountName")}
            />
          </FormField>
        </fieldset>

        {account && (
          <p className="text-xs text-muted-foreground">
            Cập nhật bởi {account.updatedBy} lúc {formatTime(account.updatedAt)}{" "}
            {formatDate(account.updatedAt)}
          </p>
        )}

        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={!isDirty || update.isPending}>
              {update.isPending ? "Đang lưu…" : "Lưu tài khoản"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!account}
              onClick={() => setShowTestQr((v) => !v)}
            >
              {showTestQr
                ? "Ẩn mã thử"
                : `Tạo mã thử ${formatVnd(TEST_QR.amount)}`}
            </Button>
          </div>
        )}
      </form>

      {showTestQr && account && <TestQr account={account} />}
    </SectionCard>
  )
}

/** QR thử theo tài khoản ĐÃ LƯU, để quét kiểm tra trước khi dùng cho khách. */
function TestQr({ account }: { account: PaymentAccount }) {
  const payload = buildVietQrPayload({
    bankBin: account.bankBin,
    accountNumber: account.accountNumber,
    amount: TEST_QR.amount,
    content: TEST_QR.content,
  })
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <figure className="rounded-xl border bg-white p-3">
        <QRCodeSVG value={payload} size={QR_SIZE} marginSize={0} />
      </figure>
      <p className="max-w-[40ch] text-[13px] text-muted-foreground">
        Quét bằng app ngân hàng: phải hiện đúng{" "}
        <b className="text-foreground">{account.bankName}</b>, tài khoản{" "}
        <b className="text-foreground">{account.accountNumber}</b>, chủ tài
        khoản <b className="text-foreground">{account.accountName}</b>, số tiền{" "}
        {formatVnd(TEST_QR.amount)}, nội dung {TEST_QR.content}.
      </p>
    </div>
  )
}
