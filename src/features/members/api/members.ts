import { http, type ApiResponse } from "@/api/http"
import type { User } from "@/types/user"

export type MemberRole = "customer" | "agency"

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface MembersResult {
  users: User[]
  counts: Record<MemberRole, number>
  pagination: Pagination
}

export const membersApi = {
  async list(params: {
    role?: MemberRole
    search?: string
    page?: number
    limit?: number
  }) {
    const res = await http.get<ApiResponse<MembersResult>>("/users", {
      params: { ...params, search: params.search || undefined },
    })
    return res.data.data
  },
}
