import type { Permission, Role } from "@/types/user"
import { useCurrentUser } from "@/features/auth/hooks/use-auth"

export function usePermission(...permissions: Permission[]) {
  const { data: user } = useCurrentUser()
  return !!user && permissions.every((p) => user.permissions.includes(p))
}

export function useHasRole(...roles: Role[]) {
  const { data: user } = useCurrentUser()
  return !!user && roles.includes(user.role)
}
