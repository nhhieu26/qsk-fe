import { env } from "@/config/env"
import { productsHttp } from "@/features/products/api/products-http"
import { productsMock } from "@/features/products/api/products-mock"
import type { ProductsRepository } from "@/features/products/api/products-repository"

export const productsApi: ProductsRepository = env.useMockApi
  ? productsMock
  : productsHttp
