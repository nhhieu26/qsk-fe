import type { StatusTone } from "@/components/common/status-pill"

type ShippingDef = {
  label: string
  description: string
  /** Phí cơ bản (đ). Backend tính lại khi lên đơn, đây là phí dự kiến hiển thị. */
  baseFee: number
  /** Đơn từ mức này (đ) được miễn phí; `undefined` = không miễn. */
  freeFrom?: number
  /** Chỉ giao trong tỉnh/thành của quầy. */
  sameProvinceOnly: boolean
  requiresAddress: boolean
}

export const SHIPPING_METHODS = {
  pickup: {
    label: "Lấy tại quầy",
    description: "Khách nhận hàng trực tiếp tại quầy",
    baseFee: 0,
    sameProvinceOnly: false,
    requiresAddress: false,
  },
  viettel: {
    label: "Viettel Post",
    description: "Giao toàn quốc, 2–4 ngày",
    baseFee: 30_000,
    freeFrom: 500_000,
    sameProvinceOnly: false,
    requiresAddress: true,
  },
  express: {
    label: "Giao hoả tốc",
    description: "Trong ngày, nội thành nơi đặt quầy",
    baseFee: 50_000,
    sameProvinceOnly: true,
    requiresAddress: true,
  },
} as const satisfies Record<string, ShippingDef>

type PaymentDef = {
  label: string
  description: string
  requiresDelivery: boolean
}

export const PAYMENT_METHODS = {
  cash: {
    label: "Tiền mặt",
    description: "Thu tại quầy",
    requiresDelivery: false,
  },
  transfer: {
    label: "Chuyển khoản",
    description: "Quét VietQR, đối soát theo mã đơn",
    requiresDelivery: false,
  },
  cod: {
    label: "Thu hộ (COD)",
    description: "Đơn vị vận chuyển thu khi giao",
    requiresDelivery: true,
  },
} as const satisfies Record<string, PaymentDef>

type StatusDef = { label: string; tone: StatusTone }

/**
 * Vòng đời đơn (giữ khớp backend `order.rules.ts`):
 *   new → approved → (giao) awaitingPickup → shipping → completed
 *                  → (tại quầy) readyForPickup → completed
 * Thứ tự key = thứ tự tab ở màn Đơn hàng.
 */
export const ORDER_STATUSES = {
  new: { label: "Mới", tone: "warning" },
  approved: { label: "Đã duyệt", tone: "violet" },
  awaitingPickup: { label: "Chờ lấy hàng", tone: "violet" },
  readyForPickup: { label: "Nhận tại quầy", tone: "violet" },
  shipping: { label: "Đang giao", tone: "violet" },
  completed: { label: "Hoàn thành", tone: "success" },
  cancelled: { label: "Đã huỷ", tone: "danger" },
} as const satisfies Record<string, StatusDef>

export const PAYMENT_STATUSES = {
  unpaid: { label: "Chưa thanh toán", tone: "warning" },
  paid: { label: "Đã thanh toán", tone: "success" },
  refunded: { label: "Đã hoàn tiền", tone: "neutral" },
} as const satisfies Record<string, StatusDef>

/** Tỷ lệ tích điểm Mi trên số tiền khách trả. */
export const POINT_EARN_RATE = 0.1

/** TODO(backend): lấy từ Cài đặt điểm quầy. Dùng để giới hạn giao hoả tốc. */
export const STORE_PROVINCE = "Hà Nội"

/** Mã BIN ngân hàng theo NAPAS, dùng cho VietQR. */
export const BANKS = [
  { bin: "970436", name: "Vietcombank" },
  { bin: "970418", name: "BIDV" },
  { bin: "970415", name: "VietinBank" },
  { bin: "970405", name: "Agribank" },
  { bin: "970407", name: "Techcombank" },
  { bin: "970422", name: "MB Bank" },
  { bin: "970416", name: "ACB" },
  { bin: "970432", name: "VPBank" },
  { bin: "970423", name: "TPBank" },
  { bin: "970403", name: "Sacombank" },
  { bin: "970441", name: "VIB" },
  { bin: "970443", name: "SHB" },
  { bin: "970437", name: "HDBank" },
  { bin: "970448", name: "OCB" },
  { bin: "970426", name: "MSB" },
  { bin: "970440", name: "SeABank" },
  { bin: "970449", name: "LPBank" },
  { bin: "970431", name: "Eximbank" },
] as const

/** 34 tỉnh, thành phố sau sắp xếp đơn vị hành chính (hiệu lực 01/07/2025). */
export const PROVINCES = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Hải Phòng",
  "Đà Nẵng",
  "Huế",
  "Cần Thơ",
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Tĩnh",
  "Hưng Yên",
  "Khánh Hòa",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "Tuyên Quang",
  "Vĩnh Long",
] as const

export const ORDER_PAGE_SIZE = 20
