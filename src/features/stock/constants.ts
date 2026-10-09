type MovementDef = {
  label: string
  /** Chiều thay đổi tồn: +1 tăng, -1 giảm, 0 tuỳ số đếm. */
  direction: 1 | -1 | 0
}

export const MOVEMENT_TYPES = {
  sale: { label: "Bán hàng", direction: -1 },
  import: { label: "Nhập kho", direction: 1 },
  loan: { label: "Cho mượn", direction: -1 },
  return: { label: "Nhận trả lại", direction: 1 },
  disposal: { label: "Huỷ, hỏng, hết hạn", direction: -1 },
  gift: { label: "Tặng, dùng cho sự kiện", direction: -1 },
  stocktake: { label: "Kiểm kê điều chỉnh", direction: 0 },
  orderCancel: { label: "Huỷ đơn, trả về kho", direction: 1 },
} as const satisfies Record<string, MovementDef>

/** Các lý do được chọn trong form "Điều chỉnh tay". */
export const MANUAL_ADJUST_TYPES = [
  "loan",
  "return",
  "disposal",
  "gift",
  "stocktake",
] as const

/** Tồn ≤ ngưỡng × hệ số này thì coi là "Gần ngưỡng". */
export const NEAR_THRESHOLD_RATIO = 1.5

export const STOCK_PAGE_SIZE = 20
export const MOVEMENT_PAGE_SIZE = 25
