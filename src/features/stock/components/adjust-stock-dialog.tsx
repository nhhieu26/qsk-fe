import { useState } from "react"

import { FilterChips } from "@/components/common/filter-chips"
import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/common/form-field"
import { Input } from "@/components/ui/input"
import type { Product } from "@/features/products/types"
import { MANUAL_ADJUST_TYPES, MOVEMENT_TYPES } from "@/features/stock/constants"
import { useAdjustStock } from "@/features/stock/hooks/use-stock"
import type { AdjustStockInput } from "@/features/stock/types"
import {
  buildAdjustInput,
  EMPTY_ADJUST_DRAFT,
  previewStock,
  type AdjustDraft,
  type StocktakeMode,
} from "@/features/stock/lib/adjust-stock"
import { notifyError, notifySuccess } from "@/lib/notify"
import { cn } from "@/lib/utils"

const FORM_ID = "adjust-stock-form"

const TYPE_OPTIONS = MANUAL_ADJUST_TYPES.map((t) => ({
  value: t,
  label: MOVEMENT_TYPES[t].label,
}))
const MODE_OPTIONS: readonly { value: StocktakeMode; label: string }[] = [
  { value: "count", label: "Số đếm được" },
  { value: "delta", label: "Số cộng trừ (+/-)" },
]

const REASON_PLACEHOLDER: Record<AdjustDraft["type"], string> = {
  loan: "Cho điểm Hà Đông mượn trưng bày",
  return: "Điểm Hà Đông trả hàng trưng bày",
  disposal: "Hộp bị móp, không bán được",
  gift: "Tặng khách trong ngày hội",
  stocktake: "Đếm sót lần trước, hàng vỡ chưa ghi...",
}

type AdjustStockDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
}

export function AdjustStockDialog({
  open,
  onOpenChange,
  product,
}: AdjustStockDialogProps) {
  const adjust = useAdjustStock()

  const submit = (input: AdjustStockInput) =>
    adjust.mutate(input, {
      onSuccess: (updated) => {
        notifySuccess(`Đã ghi vào thẻ kho, kho còn ${updated.stock}`)
        onOpenChange(false)
      },
      onError: (error) => notifyError(error),
    })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Điều chỉnh kho · ${product.name}`}
      formId={FORM_ID}
      submitLabel="Ghi vào thẻ kho"
      isSubmitting={adjust.isPending}
    >
      <AdjustForm product={product} onSubmit={submit} />
    </FormDialog>
  )
}

function AdjustForm({
  product,
  onSubmit,
}: {
  product: Product
  onSubmit: (input: AdjustStockInput) => void
}) {
  const [draft, setDraft] = useState(EMPTY_ADJUST_DRAFT)
  const [error, setError] = useState<string>()
  const set = (patch: Partial<AdjustDraft>) => setDraft({ ...draft, ...patch })

  const isStocktake = draft.type === "stocktake"
  const after = previewStock(draft, product.stock)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = buildAdjustInput(draft, product.id, product.stock)
    if (result.ok) onSubmit(result.input)
    else setError(result.error)
  }

  const changeType = (type: AdjustDraft["type"]) =>
    set({ type, quantity: type === "stocktake" ? String(product.stock) : "1" })
  const changeMode = (stocktakeMode: StocktakeMode) =>
    set({
      stocktakeMode,
      quantity: stocktakeMode === "count" ? String(product.stock) : "0",
    })

  return (
    <form
      id={FORM_ID}
      noValidate
      onSubmit={handleSubmit}
      className="grid gap-3.5"
    >
      <div className="grid gap-2">
        <span className="text-[12.5px] font-semibold text-secondary-foreground">
          Lý do thay đổi
        </span>
        <FilterChips
          options={TYPE_OPTIONS}
          value={draft.type}
          onChange={changeType}
          variant="solid"
        />
      </div>
      {isStocktake && (
        <div className="grid gap-2">
          <span className="text-[12.5px] font-semibold text-secondary-foreground">
            Nhập theo
          </span>
          <FilterChips
            options={MODE_OPTIONS}
            value={draft.stocktakeMode}
            onChange={changeMode}
            variant="solid"
          />
        </div>
      )}
      <FormField label={quantityLabel(draft, product.stock)} htmlFor="dc-qty">
        <Input
          id="dc-qty"
          type="number"
          value={draft.quantity}
          onChange={(e) => set({ quantity: e.target.value })}
        />
      </FormField>
      {isStocktake && after !== undefined && (
        <StockPreview before={product.stock} after={after} />
      )}
      {(draft.type === "loan" || draft.type === "return") && (
        <FormField label="Người mượn hoặc người trả" htmlFor="dc-party">
          <Input
            id="dc-party"
            placeholder="Tên người, hoặc tên điểm"
            value={draft.counterparty}
            onChange={(e) => set({ counterparty: e.target.value })}
          />
        </FormField>
      )}
      <FormField
        label={isStocktake ? "Lý do lệch" : "Lý do, ghi cho người sau đọc hiểu"}
        htmlFor="dc-reason"
      >
        <Input
          id="dc-reason"
          placeholder={REASON_PLACEHOLDER[draft.type]}
          value={draft.reason}
          onChange={(e) => set({ reason: e.target.value })}
        />
      </FormField>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  )
}

function quantityLabel(draft: AdjustDraft, stock: number): string {
  if (draft.type !== "stocktake") return "Số lượng"
  return draft.stocktakeMode === "count"
    ? `Số đếm được thực tế, máy đang ghi ${stock}`
    : `Số cần cộng hoặc trừ, đang có ${stock}. Gõ số âm để trừ, ví dụ -20`
}

function StockPreview({ before, after }: { before: number; after: number }) {
  if (after < 0)
    return (
      <p className="text-[13px] text-destructive">
        Không hợp lệ, kho không thể âm
      </p>
    )
  const diff = after - before
  return (
    <p className="text-[13px] text-secondary-foreground">
      Kho từ <b>{before}</b> → <b>{after}</b>
      {diff !== 0 && (
        <span
          className={cn("ml-1", diff < 0 ? "text-destructive" : "text-success")}
        >
          ({diff > 0 ? "+" : ""}
          {diff})
        </span>
      )}
    </p>
  )
}
