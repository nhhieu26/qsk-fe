import { ApiError } from "@/api/http"
import { BANKS } from "@/features/sales/constants"
import type { SettingsRepository } from "@/features/settings/api/settings-repository"
import type { ShopSettings } from "@/features/settings/types"
import { MOCK_ACTOR, withLatency } from "@/mocks/mock-store"

const MOCK_RULES: ShopSettings["rules"] = [
  {
    group: "sales",
    label: "Tích điểm Mi khi mua hàng",
    value: "10% tiền hàng khách trả",
  },
  {
    group: "sales",
    label: "Dùng điểm Mi",
    value: "1 điểm = 1đ, không trừ vào phí ship",
  },
  {
    group: "shipping",
    label: "Miễn phí giao Viettel Post",
    value: "Đơn từ 500.000đ",
  },
  {
    group: "shipping",
    label: "Giao hoả tốc",
    value: "50.000đ, chỉ trong Hà Nội",
  },
  {
    group: "stock",
    label: "Tồn kho",
    value: "Không cho âm, mọi thay đổi đều ghi thẻ kho",
  },
]

let settings: ShopSettings = {
  store: { name: "Quầy Sức Khỏe Văn Phúc", phone: "", address: "", code: "VP" },
  rules: MOCK_RULES,
}

export const settingsMock: SettingsRepository = {
  get: () => withLatency(() => structuredClone(settings)),

  updateStore: (input) =>
    withLatency(() => {
      settings = { ...settings, store: { ...input } }
      return structuredClone(settings)
    }),

  updatePaymentAccount: (input) =>
    withLatency(() => {
      const bank = BANKS.find((b) => b.bin === input.bankBin)
      if (!bank) throw new ApiError("Chọn ngân hàng", 400)
      settings = {
        ...settings,
        paymentAccount: {
          ...input,
          accountName: input.accountName.toUpperCase(),
          bankName: bank.name,
          updatedBy: MOCK_ACTOR,
          updatedAt: new Date().toISOString(),
        },
      }
      return structuredClone(settings)
    }),
}
