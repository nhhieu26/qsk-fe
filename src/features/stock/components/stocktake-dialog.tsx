import { useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { InfoRow } from "@/components/common/section-card"
import { Input } from "@/components/ui/input"
import type { Product } from "@/features/products/types"
import { useStocktake } from "@/features/stock/hooks/use-stock"
import type { StocktakeInput } from "@/features/stock/types"
import { notifyError, notifySuccess } from "@/lib/notify"

const FORM_ID = "stocktake-form"

type StocktakeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: readonly Product[]
}

/** Kiểm kê cả kho: chỉ những ô có nhập và khác số máy mới được điều chỉnh. */
export function StocktakeDialog({
  open,
  onOpenChange,
  products,
}: StocktakeDialogProps) {
  const stocktake = useStocktake()

  const submit = (input: StocktakeInput) => {
    if (input.counts.length === 0) {
      notifySuccess("Không có chênh lệch nào")
      onOpenChange(false)
      return
    }
    stocktake.mutate(input, {
      onSuccess: ({ adjustedCount }) => {
        notifySuccess(
          `Đã điều chỉnh ${adjustedCount} mặt hàng, có ghi vào thẻ kho`
        )
        onOpenChange(false)
      },
      onError: (error) => notifyError(error),
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Kiểm kê kho"
      description="Nhập số đếm được thực tế. Để trống những mặt hàng không kiểm."
      formId={FORM_ID}
      submitLabel="Ghi số đếm được"
      isSubmitting={stocktake.isPending}
    >
      <StocktakeForm products={products} onSubmit={submit} />
    </FormDialog>
  )
}

function StocktakeForm({
  products,
  onSubmit,
}: {
  products: readonly Product[]
  onSubmit: (input: StocktakeInput) => void
}) {
  const [counts, setCounts] = useState<Readonly<Record<string, string>>>({})
  const [error, setError] = useState<string>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const entries = products
      .filter((p) => (counts[p.id] ?? "") !== "")
      .map((p) => ({ product: p, counted: Number(counts[p.id]) }))

    if (entries.some((x) => !Number.isInteger(x.counted) || x.counted < 0)) {
      setError("Số đếm phải là số nguyên không âm")
      return
    }
    onSubmit({
      counts: entries
        .filter((x) => x.counted !== x.product.stock)
        .map((x) => ({ productId: x.product.id, countedQuantity: x.counted })),
    })
  }

  return (
    <form id={FORM_ID} noValidate onSubmit={handleSubmit}>
      {products.map((p) => (
        <InfoRow
          key={p.id}
          label={
            <label htmlFor={`kk-${p.id}`}>
              <span className="font-medium">{p.name}</span>{" "}
              <span className="text-[12.5px] text-muted-foreground">
                máy ghi {p.stock}
              </span>
            </label>
          }
        >
          <Input
            id={`kk-${p.id}`}
            type="number"
            min={0}
            placeholder={String(p.stock)}
            value={counts[p.id] ?? ""}
            onChange={(e) => setCounts({ ...counts, [p.id]: e.target.value })}
            className="w-[90px]"
          />
        </InfoRow>
      ))}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </form>
  )
}
