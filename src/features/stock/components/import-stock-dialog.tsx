import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/common/form-field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { Product } from "@/features/products/types"
import { useImportStock } from "@/features/stock/hooks/use-stock"
import type { ImportStockInput } from "@/features/stock/types"
import { notifyError, notifySuccess } from "@/lib/notify"

const FORM_ID = "import-stock-form"
const DEFAULT_QUANTITY = 10

const schema = z.object({
  productId: z.string().min(1, "Chọn mặt hàng"),
  quantity: z.coerce
    .number({ error: "Nhập số" })
    .int("Nhập số nguyên")
    .min(1, "Ít nhất 1"),
  reference: z.string().trim(),
  note: z.string().trim(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

type ImportStockDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: readonly Product[]
  /** Mặt hàng chọn sẵn. */
  productId?: string
}

export function ImportStockDialog({
  open,
  onOpenChange,
  products,
  productId,
}: ImportStockDialogProps) {
  const importStock = useImportStock()

  const submit = (input: ImportStockInput) =>
    importStock.mutate(input, {
      onSuccess: (product) => {
        notifySuccess(
          `Đã nhập ${input.quantity} ${product.name}, tồn còn ${product.stock}`
        )
        onOpenChange(false)
      },
      onError: (error) => notifyError(error),
    })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nhập kho"
      formId={FORM_ID}
      submitLabel="Ghi nhập kho"
      isSubmitting={importStock.isPending}
    >
      <ImportStockForm
        products={products}
        productId={productId}
        onSubmit={submit}
      />
    </FormDialog>
  )
}

function ImportStockForm({
  products,
  productId,
  onSubmit,
}: {
  products: readonly Product[]
  productId?: string
  onSubmit: (input: ImportStockInput) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: productId ?? products[0]?.id ?? "",
      quantity: DEFAULT_QUANTITY,
      reference: "",
      note: "",
    },
  })

  const toInput = (values: FormOutput) =>
    onSubmit({
      productId: values.productId,
      quantity: values.quantity,
      reference: values.reference || undefined,
      note: values.note || undefined,
    })

  return (
    <form
      id={FORM_ID}
      noValidate
      onSubmit={handleSubmit(toInput)}
      className="grid gap-3.5"
    >
      <FormField
        label="Mặt hàng"
        htmlFor="ik-product"
        error={errors.productId?.message}
      >
        <NativeSelect
          id="ik-product"
          className="w-full"
          {...register("productId")}
        >
          {products.map((p) => (
            <NativeSelectOption key={p.id} value={p.id}>
              {p.name} · tồn {p.stock}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </FormField>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <FormField
          label="Số lượng nhập"
          htmlFor="ik-qty"
          error={errors.quantity?.message}
        >
          <Input
            id="ik-qty"
            type="number"
            min={1}
            aria-invalid={!!errors.quantity}
            {...register("quantity")}
          />
        </FormField>
        <FormField label="Số phiếu nhập, nếu có" htmlFor="ik-ref">
          <Input id="ik-ref" placeholder="PN-..." {...register("reference")} />
        </FormField>
      </div>
      <FormField label="Ghi chú" htmlFor="ik-note">
        <Input
          id="ik-note"
          placeholder="Nhập từ công ty đợt..."
          {...register("note")}
        />
      </FormField>
    </form>
  )
}
