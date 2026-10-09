import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { authApi } from "@/features/auth/api/auth"
import type { User } from "@/types/user"

const currentUserKey = ["auth", "me"] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSetCurrentUser() {
  const queryClient = useQueryClient()
  return (user: User | null) => queryClient.setQueryData(currentUserKey, user)
}

export function useLogout() {
  const setCurrentUser = useSetCurrentUser()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => setCurrentUser(null),
  })
}
