import type { CustomersRepository } from "@/features/customers/api/customers-repository"
import { normalizeSearch } from "@/lib/format"
import { mockStore, withLatency } from "@/mocks/mock-store"

const MAX_RESULTS = 10

export const customersMock: CustomersRepository = {
  search: (query) =>
    withLatency(() => {
      const q = normalizeSearch(query)
      return mockStore
        .listCustomers()
        .filter(
          (c) =>
            !q ||
            normalizeSearch(c.name).includes(q) ||
            c.phone.includes(query.trim()) ||
            normalizeSearch(c.memberCode).includes(q)
        )
        .slice(0, MAX_RESULTS)
    }),
}
