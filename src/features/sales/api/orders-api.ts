import { env } from "@/config/env"
import { ordersHttp } from "@/features/sales/api/orders-http"
import { ordersMock } from "@/features/sales/api/orders-mock"
import type { OrdersRepository } from "@/features/sales/api/orders-repository"

export const ordersApi: OrdersRepository = env.useMockApi
  ? ordersMock
  : ordersHttp
