import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/common/form-field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { DOCUMENT_TYPES } from "@/features/products/constants"
import { useAddDocument } from "@/features/products/hooks/use-products"
import {
  documentLabel,
  isDocumentRequired,
} from "@/features/products/lib/product-compliance"
import type {
  AddDocumentInput,
  DocumentType,
  Product,
} from "@/features/products/types"
import { notifyError, notifySuccess } from "@/lib/notify"

const FORM_ID = "document-form"
const DOCUMENT_KEYS = DOCUMENT_TYPES.map((d) => d.key) as [
  DocumentType,
  ...DocumentType[],
]

const schema = z.object({
  type: z.enum(DOCUMENT_KEYS),
  url: z.url({ error: "Dán đường dẫn hợp lệ (https://...)" }),
  expiresAt: z.string(),
  note: z.string().trim(),
})

type FormValues = z.infer<typeof schema>

type DocumentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
}

/**
 * Hiện nhận đường dẫn tới tệp. TODO(backend): thêm upload tệp khi có API
 * lưu file, form chỉ cần đổi ô URL thành ô chọn tệp.
 */
export function DocumentFormDialog({
  open,
  onOpenChange,
  product,
}: DocumentFormDialogProps) {
  const add = useAddDocument(product.id)

  const submit = (input: AddDocumentInput) =>
    add.mutate(input, {
      onSuccess: () => {
        notifySuccess("Đã lưu tài liệu")
        onOpenChange(false)
      },
      onError: (error) => notifyError(error),
    })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Tải tài liệu · ${product.name}`}
      formId={FORM_ID}
      submitLabel="Lưu tài liệu"
      isSubmitting={add.isPending}
    >
      <DocumentForm product={product} onSubmit={submit} />
    </FormDialog>
  )
}

function DocumentForm({
  product,
  onSubmit,
}: {
  product: Product
  onSubmit: (input: AddDocumentInput) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "registration", url: "", expiresAt: "", note: "" },
  })

  const toInput = (values: FormValues) =>
    onSubmit({
      type: values.type,
      url: values.url,
      expiresAt: values.expiresAt || undefined,
      note: values.note || undefined,
    })

  return (
    <form
      id={FORM_ID}
      noValidate
      onSubmit={handleSubmit(toInput)}
      className="grid gap-3.5"
    >
      <FormField label="Loại tài liệu" htmlFor="d-type">
        <NativeSelect id="d-type" className="w-full" {...register("type")}>
          {DOCUMENT_TYPES.map(({ key }) => (
            <NativeSelectOption key={key} value={key}>
              {documentLabel(key, product)}
              {isDocumentRequired(key, product) ? " (bắt buộc)" : ""}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </FormField>
      <FormField
        label="Đường dẫn tới tệp"
        htmlFor="d-url"
        error={errors.url?.message}
      >
        <Input
          id="d-url"
          placeholder="https://drive.google.com/..."
          aria-invalid={!!errors.url}
          {...register("url")}
        />
      </FormField>
      <FormField label="Ngày hết hiệu lực, nếu giấy có ghi" htmlFor="d-exp">
        <Input id="d-exp" type="date" {...register("expiresAt")} />
      </FormField>
      <FormField label="Ghi chú" htmlFor="d-note">
        <Input
          id="d-note"
          placeholder="Số hiệu giấy, ngày cấp"
          {...register("note")}
        />
      </FormField>
    </form>
  )
}
