import { env } from "@/config/env"
import { stockHttp } from "@/features/stock/api/stock-http"
import { stockMock } from "@/features/stock/api/stock-mock"
import type { StockRepository } from "@/features/stock/api/stock-repository"

export const stockApi: StockRepository = env.useMockApi ? stockMock : stockHttp
