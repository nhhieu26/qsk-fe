import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { shippingApi } from "@/features/shipping/api/shipping-api"
import type { ShippingQuoteInput } from "@/features/shipping/types"

/** Danh mục địa chỉ gần như không đổi trong ngày. */
const AREA_STALE_MS = 24 * 60 * 60 * 1000

export const shippingKeys = {
  all: ["shipping"] as const,
  provinces: () => [...shippingKeys.all, "provinces"] as const,
  wards: (provinceId: number) =>
    [...shippingKeys.all, "wards", provinceId] as const,
  quote: (input: ShippingQuoteInput) =>
    [...shippingKeys.all, "quote", input] as const,
}

export function useProvinces() {
  return useQuery({
    queryKey: shippingKeys.provinces(),
    queryFn: shippingApi.listProvinces,
    staleTime: AREA_STALE_MS,
  })
}

/** Chỉ gọi khi đã chọn tỉnh. */
export function useWards(provinceId: number | undefined) {
  return useQuery({
    queryKey: shippingKeys.wards(provinceId ?? 0),
    queryFn: () => shippingApi.listWards(provinceId ?? 0),
    enabled: provinceId !== undefined,
    staleTime: AREA_STALE_MS,
  })
}

/**
 * Báo phí ship khi đổi phương thức giao / địa chỉ / giỏ. Truyền `undefined` khi
 * chưa đủ thông tin (vd giao hàng mà chưa chọn phường) để không gọi.
 */
export function useShippingQuote(input: ShippingQuoteInput | undefined) {
  return useQuery({
    queryKey: shippingKeys.quote(input ?? { method: "pickup", lines: [] }),
    queryFn: () => {
      if (!input) throw new Error("Thiếu thông tin báo phí")
      return shippingApi.quote(input)
    },
    enabled: input !== undefined && input.lines.length > 0,
    placeholderData: keepPreviousData,
    retry: false,
  })
}
