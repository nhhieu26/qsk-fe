import { env } from "@/config/env"
import { customersHttp } from "@/features/customers/api/customers-http"
import { customersMock } from "@/features/customers/api/customers-mock"
import type { CustomersRepository } from "@/features/customers/api/customers-repository"

export const customersApi: CustomersRepository = env.useMockApi
  ? customersMock
  : customersHttp
