import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { customersApi } from "@/features/customers/api/customers-api"

export const customerKeys = {
  all: ["customers"] as const,
  search: (query: string) => [...customerKeys.all, "search", query] as const,
}

export function useCustomerSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.search(query),
    queryFn: () => customersApi.search(query),
    enabled,
    placeholderData: keepPreviousData,
  })
}
