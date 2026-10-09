import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/common/form-field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { PRODUCT_CATEGORIES } from "@/features/products/constants"
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/features/products/hooks/use-products"
import { CATEGORY_KEYS } from "@/features/products/lib/product-compliance"
import type {
  Product,
  ProductCategory,
  ProductInput,
} from "@/features/products/types"
import { notifyError, notifySuccess } from "@/lib/notify"

const FORM_ID = "product-form"
const DEFAULT_THRESHOLD = 10

const money = z.coerce
  .number({ error: "Nhập số" })
  .int()
  .min(0, "Không được âm")

const schema = z.object({
  name: z.string().trim().min(2, "Nhập tên sản phẩm"),
  customerGroup: z.string().trim(),
  category: z.union([
    z.literal(""),
    z.enum(CATEGORY_KEYS as [ProductCategory, ...ProductCategory[]]),
  ]),
  price: money,
  costPrice: money,
  threshold: money,
  initialStock: money,
  registrationNo: z.string().trim(),
  shelfLife: z.string().trim(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

function toDefaults(product: Product | undefined): FormInput {
  return {
    name: product?.name ?? "",
    customerGroup: product?.customerGroup ?? "",
    category: product?.category ?? "",
    price: product?.price ?? 0,
    costPrice: product?.costPrice ?? 0,
    threshold: product?.threshold ?? DEFAULT_THRESHOLD,
    initialStock: 0,
    registrationNo: product?.registrationNo ?? "",
    shelfLife: product?.shelfLife ?? "",
  }
}

function toInput(values: FormOutput): ProductInput {
  const optional = (v: string) => (v === "" ? undefined : v)
  return {
    name: values.name,
    customerGroup: optional(values.customerGroup),
    category: values.category === "" ? undefined : values.category,
    price: values.price,
    costPrice: values.costPrice > 0 ? values.costPrice : undefined,
    threshold: values.threshold,
    registrationNo: optional(values.registrationNo),
    shelfLife: optional(values.shelfLife),
  }
}

type ProductFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Không truyền = tạo mới. */
  product?: Product
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  const isNew = product === undefined
  const create = useCreateProduct()
  const update = useUpdateProduct(product?.id ?? "")

  const submit = async (values: FormOutput) => {
    try {
      if (isNew) {
        await create.mutateAsync({
          ...toInput(values),
          initialStock: values.initialStock,
        })
      } else {
        await update.mutateAsync(toInput(values))
      }
      notifySuccess("Đã lưu sản phẩm")
      onOpenChange(false)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isNew ? "Sản phẩm mới" : "Sửa sản phẩm"}
      formId={FORM_ID}
      submitLabel="Lưu"
      isSubmitting={create.isPending || update.isPending}
    >
      <ProductForm product={product} onSubmit={submit} />
    </FormDialog>
  )
}

function ProductForm({
  product,
  onSubmit,
}: {
  product?: Product
  onSubmit: (values: FormOutput) => void
}) {
  const isNew = product === undefined
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(product),
  })

  return (
    <form
      id={FORM_ID}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-3.5"
    >
      <div className="grid gap-3.5 sm:grid-cols-2">
        <FormField
          label="Tên sản phẩm"
          htmlFor="p-name"
          error={errors.name?.message}
        >
          <Input
            id="p-name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </FormField>
        <FormField label="Nhóm khách" htmlFor="p-group">
          <Input
            id="p-group"
            placeholder="Cả ba nhóm"
            {...register("customerGroup")}
          />
        </FormField>
        <FormField
          label="Giá bán"
          htmlFor="p-price"
          error={errors.price?.message}
        >
          <Input id="p-price" type="number" min={0} {...register("price")} />
        </FormField>
        <FormField
          label="Giá nhập cho điểm"
          htmlFor="p-cost"
          error={errors.costPrice?.message}
        >
          <Input id="p-cost" type="number" min={0} {...register("costPrice")} />
        </FormField>
        {isNew && (
          <FormField
            label="Tồn đầu"
            htmlFor="p-stock"
            error={errors.initialStock?.message}
          >
            <Input
              id="p-stock"
              type="number"
              min={0}
              {...register("initialStock")}
            />
          </FormField>
        )}
        <FormField
          label="Ngưỡng cảnh báo"
          htmlFor="p-threshold"
          error={errors.threshold?.message}
        >
          <Input
            id="p-threshold"
            type="number"
            min={0}
            {...register("threshold")}
          />
        </FormField>
        <FormField label="Số công bố" htmlFor="p-reg">
          <Input
            id="p-reg"
            placeholder="2780/2021/ĐKSP"
            {...register("registrationNo")}
          />
        </FormField>
        <FormField label="Hạn dùng" htmlFor="p-shelf">
          <Input
            id="p-shelf"
            placeholder="36 tháng"
            {...register("shelfLife")}
          />
        </FormField>
      </div>
      <FormField label="Loại hàng" htmlFor="p-category">
        <NativeSelect
          id="p-category"
          className="w-full"
          {...register("category")}
        >
          <NativeSelectOption value="">Chưa phân loại</NativeSelectOption>
          {CATEGORY_KEYS.map((k) => (
            <NativeSelectOption key={k} value={k}>
              {PRODUCT_CATEGORIES[k].label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </FormField>
    </form>
  )
}
