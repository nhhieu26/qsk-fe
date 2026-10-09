import type {
  ShopSettings,
  UpdatePaymentAccountInput,
  UpdateStoreInput,
} from "@/features/settings/types"

/** Hợp đồng dữ liệu cài đặt quầy, cài bằng HTTP (thật) hoặc mock. */
export type SettingsRepository = {
  get: () => Promise<ShopSettings>
  updateStore: (input: UpdateStoreInput) => Promise<ShopSettings>
  updatePaymentAccount: (
    input: UpdatePaymentAccountInput
  ) => Promise<ShopSettings>
}
