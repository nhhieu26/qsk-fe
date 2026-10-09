/** Thông tin điểm quầy. Chuỗi rỗng = chưa nhập. */
export type StoreInfo = {
  name: string
  phone: string
  address: string
  /** Mã điểm, đầu mã hội viên (chữ hoa + số, tối đa 6). */
  code: string
}

/** Tài khoản nhận chuyển khoản (VietQR) của quầy. */
export type PaymentAccount = {
  bankBin: string
  bankName: string
  accountNumber: string
  accountName: string
  updatedBy: string
  updatedAt: string
}

export type RuleGroup = "sales" | "shipping" | "stock"

/** Quy tắc hệ thống đang thực thi, backend dựng từ chính cấu hình tính tiền. */
export type AppliedRule = {
  group: RuleGroup
  label: string
  value: string
}

export type ShopSettings = {
  store: StoreInfo
  /** Không có khi quầy chưa cài. */
  paymentAccount?: PaymentAccount
  rules: readonly AppliedRule[]
}

export type UpdateStoreInput = StoreInfo

export type UpdatePaymentAccountInput = Pick<
  PaymentAccount,
  "bankBin" | "accountNumber" | "accountName"
>
