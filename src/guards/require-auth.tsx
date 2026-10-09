import { Navigate } from "react-router"

import { useCurrentUser } from "@/features/auth/hooks/use-auth"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: user, isPending, isError } = useCurrentUser()

  if (isPending) return null
  if (isError || !user) return <Navigate to="/login" replace />
  return children
}
