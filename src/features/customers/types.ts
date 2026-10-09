/** Địa chỉ theo đơn vị hành chính 2 cấp (từ 01/07/2025): tỉnh/thành → phường/xã. */
export type Address = {
  province: string
  ward: string
  /** Số nhà, tên đường, thôn/xóm. */
  street: string
  /** Id tỉnh/phường theo danh mục ViettelPost (`GET /shipping/provinces`). */
  provinceId?: number
  wardId?: number
}

export type InvoiceBuyerType = "personal" | "company"

/** Thông tin xuất hoá đơn điện tử. */
export type InvoiceInfo = {
  buyerType: InvoiceBuyerType
  /** Tên người mua (cá nhân) hoặc tên đơn vị (công ty). */
  buyerName: string
  taxCode?: string
  address: string
  email: string
}

export type Customer = {
  id: string
  name: string
  phone: string
  email?: string
  /** Mã hội viên nếu là hội viên. */
  memberCode?: string
  /** Số điểm Mi hiện có. */
  points: number
  addresses: readonly Address[]
  /** Thông tin xuất hoá đơn dùng lần gần nhất. */
  lastInvoice?: InvoiceInfo
}
