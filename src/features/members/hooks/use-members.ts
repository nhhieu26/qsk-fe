import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { membersApi, type MemberRole } from "@/features/members/api/members"

export function useMembers(params: {
  role?: MemberRole
  search?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ["members", params],
    queryFn: () => membersApi.list(params),
    placeholderData: keepPreviousData,
  })
}
