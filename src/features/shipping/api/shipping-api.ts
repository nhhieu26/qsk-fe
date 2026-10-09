import { env } from "@/config/env"
import { shippingHttp } from "@/features/shipping/api/shipping-http"
import { shippingMock } from "@/features/shipping/api/shipping-mock"
import type { ShippingRepository } from "@/features/shipping/api/shipping-repository"

export const shippingApi: ShippingRepository = env.useMockApi
  ? shippingMock
  : shippingHttp
