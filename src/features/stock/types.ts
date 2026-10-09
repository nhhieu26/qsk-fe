import type {
  MANUAL_ADJUST_TYPES,
  MOVEMENT_TYPES,
} from "@/features/stock/constants"

export type MovementType = keyof typeof MOVEMENT_TYPES
export type ManualAdjustType = (typeof MANUAL_ADJUST_TYPES)[number]

/** Một dòng thẻ kho: mọi thay đổi tồn đều có vết. */
export type StockMovement = {
  id: string
  productId: string
  productName: string
  type: MovementType
  /** Số thay đổi, âm là giảm. */
  quantity: number
  before: number
  after: number
  actor: string
  reason?: string
  /** Số chứng từ, ví dụ số phiếu nhập. */
  reference?: string
  /** Người mượn / người trả / đối tác liên quan. */
  counterparty?: string
  createdAt: string
}

export type ImportStockInput = {
  productId: string
  quantity: number
  reference?: string
  note?: string
  /** Nhà cung cấp, hiện ở cột "Người mượn / đối tác" của thẻ kho. */
  supplier?: string
  /** Đơn giá nhập (VND); có thì backend cập nhật `costPrice` của sản phẩm. */
  unitPrice?: number
}

export type AdjustStockInput =
  | {
      productId: string
      type: Exclude<ManualAdjustType, "stocktake">
      quantity: number
      reason: string
      counterparty?: string
    }
  | {
      productId: string
      type: "stocktake"
      /** Số đếm thực tế sau kiểm kê. */
      countedQuantity: number
      reason: string
    }

export type StocktakeInput = {
  counts: readonly { productId: string; countedQuantity: number }[]
}

export type ReturnLoanInput = {
  productId: string
  loanId: string
  quantity: number
  note?: string
}
