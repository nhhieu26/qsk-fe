import { useState } from "react"

import type { MemberRole } from "@/features/members/api/members"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

const PAGE_SIZE = 10

export function useMemberFilters() {
  const [role, setRoleState] = useState<MemberRole | undefined>()
  const [search, setSearchState] = useState("")
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search.trim())

  const setRole = (value: MemberRole | undefined) => {
    setRoleState(value)
    setPage(1)
  }

  const setSearch = (value: string) => {
    setSearchState(value)
    setPage(1)
  }

  return {
    role,
    setRole,
    search,
    setSearch,
    page,
    setPage,
    params: { role, search: debouncedSearch, page, limit: PAGE_SIZE },
  }
}
