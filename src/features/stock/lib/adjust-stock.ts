import { MOVEMENT_TYPES } from "@/features/stock/constants"
import type { AdjustStockInput, ManualAdjustType } from "@/features/stock/types"

export type StocktakeMode = "count" | "delta"

export type AdjustDraft = {
  type: ManualAdjustType
  stocktakeMode: StocktakeMode
  quantity: string
  counterparty: string
  reason: string
}

export const EMPTY_ADJUST_DRAFT: AdjustDraft = {
  type: "loan",
  stocktakeMode: "count",
  quantity: "1",
  counterparty: "",
  reason: "",
}

/** Tồn sau khi áp bản nháp, `undefined` nếu số chưa hợp lệ. */
export function previewStock(
  draft: AdjustDraft,
  current: number
): number | undefined {
  if (draft.quantity.trim() === "") return undefined
  const n = Number(draft.quantity)
  if (!Number.isInteger(n)) return undefined
  if (draft.type === "stocktake")
    return draft.stocktakeMode === "count" ? n : current + n
  return current + MOVEMENT_TYPES[draft.type].direction * n
}

export type AdjustResult =
  { ok: true; input: AdjustStockInput } | { ok: false; error: string }

export function buildAdjustInput(
  draft: AdjustDraft,
  productId: string,
  current: number
): AdjustResult {
  const reason = draft.reason.trim()
  const after = previewStock(draft, current)
  if (after === undefined) return { ok: false, error: "Nhập số nguyên hợp lệ" }
  if (after < 0)
    return {
      ok: false,
      error: `Kho chỉ còn ${current}, không trừ được nhiều hơn thế`,
    }

  if (draft.type === "stocktake") {
    if (after === current) return { ok: false, error: "Không có chênh lệch" }
    if (!reason) return { ok: false, error: "Ghi lý do lệch" }
    return {
      ok: true,
      input: { productId, type: "stocktake", countedQuantity: after, reason },
    }
  }

  const quantity = Number(draft.quantity)
  const counterparty = draft.counterparty.trim()
  if (quantity < 1) return { ok: false, error: "Nhập số lượng" }
  if (!reason) return { ok: false, error: "Ghi lý do, người sau cần đọc hiểu" }
  if (draft.type === "loan" && !counterparty)
    return { ok: false, error: "Ghi tên người mượn" }
  return {
    ok: true,
    input: {
      productId,
      type: draft.type,
      quantity,
      reason,
      counterparty: counterparty || undefined,
    },
  }
}
