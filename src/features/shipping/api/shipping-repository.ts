import type {
  AreaOption,
  ShippingQuote,
  ShippingQuoteInput,
} from "@/features/shipping/types"

/** Hợp đồng dữ liệu vận chuyển, cài bằng HTTP (thật) hoặc mock. */
export type ShippingRepository = {
  listProvinces: () => Promise<AreaOption[]>
  listWards: (provinceId: number) => Promise<AreaOption[]>
  quote: (input: ShippingQuoteInput) => Promise<ShippingQuote>
}
