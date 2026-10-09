import { useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/common/form-field"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateClaims } from "@/features/products/hooks/use-products"
import type { Product } from "@/features/products/types"
import { notifyError, notifySuccess } from "@/lib/notify"

const FORM_ID = "claims-form"

type ClaimsFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
}

export function ClaimsFormDialog({
  open,
  onOpenChange,
  product,
}: ClaimsFormDialogProps) {
  const update = useUpdateClaims(product.id)

  const submit = (claims: readonly string[]) =>
    update.mutate(claims, {
      onSuccess: () => {
        notifySuccess("Đã lưu câu công dụng")
        onOpenChange(false)
      },
      onError: (error) => notifyError(error),
    })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Câu công dụng · ${product.name}`}
      formId={FORM_ID}
      submitLabel="Lưu"
      isSubmitting={update.isPending}
    >
      <ClaimsForm initialClaims={product.claims} onSubmit={submit} />
    </FormDialog>
  )
}

/** Mount lại mỗi lần mở dialog nên state luôn lấy từ dữ liệu mới nhất. */
function ClaimsForm({
  initialClaims,
  onSubmit,
}: {
  initialClaims: readonly string[]
  onSubmit: (claims: readonly string[]) => void
}) {
  const [text, setText] = useState(() => initialClaims.join("\n"))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(
      text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "")
    )
  }

  return (
    <form id={FORM_ID} onSubmit={handleSubmit}>
      <FormField
        label="Mỗi dòng một câu công dụng, chép nguyên từ hồ sơ đã duyệt"
        htmlFor="claims"
      >
        <Textarea
          id="claims"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px]"
        />
      </FormField>
    </form>
  )
}
