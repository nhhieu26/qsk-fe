import { Navigate } from "react-router"

import type { Permission } from "@/types/user"
import { useCurrentUser } from "@/features/auth/hooks/use-auth"
import { usePermission } from "@/features/auth/hooks/use-permission"

// Dùng bên trong RequireAuth
export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission
  children: React.ReactNode
}) {
  const { isPending } = useCurrentUser()
  const allowed = usePermission(permission)

  if (isPending) return null
  if (!allowed) return <Navigate to="/" replace />
  return children
}
