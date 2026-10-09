import { ApiError, http, type ApiResponse } from "@/api/http"
import type { User } from "@/types/user"

export type { User }

export const authApi = {
  ssoLoginUrl() {
    return http.getUri({ url: "/auth/sso/login" })
  },

  async ssoCallback(body: { code: string; state: string }) {
    const res = await http.post<ApiResponse<{ user: User }>>(
      "/auth/sso/callback",
      body
    )
    return res.data.data.user
  },

  async me() {
    try {
      const res = await http.get<ApiResponse<{ user: User }>>("/auth/me")
      return res.data.data.user
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null
      throw error
    }
  },

  async logout() {
    await http.post("/auth/logout")
  },
}
