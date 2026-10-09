import { describe, expect, it } from "vitest"

import {
  buildAdjustInput,
  EMPTY_ADJUST_DRAFT,
  previewStock,
  type AdjustDraft,
} from "@/features/stock/lib/adjust-stock"

function draft(overrides: Partial<AdjustDraft>): AdjustDraft {
  return { ...EMPTY_ADJUST_DRAFT, reason: "lý do", ...overrides }
}

describe("previewStock", () => {
  it("subtracts for a decreasing movement", () => {
    expect(previewStock(draft({ type: "disposal", quantity: "3" }), 10)).toBe(7)
  })

  it("adds for an increasing movement", () => {
    expect(previewStock(draft({ type: "return", quantity: "3" }), 10)).toBe(13)
  })

  it("uses the counted number in stocktake count mode", () => {
    expect(previewStock(draft({ type: "stocktake", quantity: "4" }), 10)).toBe(
      4
    )
  })

  it("applies a signed delta in stocktake delta mode", () => {
    const d = draft({
      type: "stocktake",
      stocktakeMode: "delta",
      quantity: "-2",
    })
    expect(previewStock(d, 10)).toBe(8)
  })

  it("returns undefined for a non-integer input", () => {
    expect(previewStock(draft({ quantity: "1.5" }), 10)).toBeUndefined()
  })
})

describe("buildAdjustInput", () => {
  it("rejects taking more than is in stock", () => {
    const result = buildAdjustInput(
      draft({ type: "gift", quantity: "11" }),
      "p",
      10
    )
    expect(result.ok).toBe(false)
  })

  it("requires a borrower for loans", () => {
    const result = buildAdjustInput(
      draft({ type: "loan", quantity: "1" }),
      "p",
      10
    )
    expect(result).toEqual({ ok: false, error: "Ghi tên người mượn" })
  })

  it("requires a reason", () => {
    const result = buildAdjustInput(
      draft({ type: "gift", quantity: "1", reason: " " }),
      "p",
      10
    )
    expect(result.ok).toBe(false)
  })

  it("rejects a stocktake with no difference", () => {
    const result = buildAdjustInput(
      draft({ type: "stocktake", quantity: "10" }),
      "p",
      10
    )
    expect(result).toEqual({ ok: false, error: "Không có chênh lệch" })
  })

  it("builds a stocktake input with the counted quantity", () => {
    const result = buildAdjustInput(
      draft({ type: "stocktake", quantity: "7" }),
      "p",
      10
    )
    expect(result).toEqual({
      ok: true,
      input: {
        productId: "p",
        type: "stocktake",
        countedQuantity: 7,
        reason: "lý do",
      },
    })
  })

  it("builds a loan input with the borrower", () => {
    const d = draft({ type: "loan", quantity: "2", counterparty: " Điểm A " })
    expect(buildAdjustInput(d, "p", 10)).toEqual({
      ok: true,
      input: {
        productId: "p",
        type: "loan",
        quantity: 2,
        reason: "lý do",
        counterparty: "Điểm A",
      },
    })
  })
})
