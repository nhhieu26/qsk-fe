import type { Permission } from "@/features/access/permissions"
import { usePermissions } from "@/features/access/use-permissions"

type CanProps = {
  permission: Permission
  fallback?: React.ReactNode
  children: React.ReactNode
}

/** Chỉ render `children` khi tài khoản có quyền. */
export function Can({ permission, fallback = null, children }: CanProps) {
  const { can } = usePermissions()
  return can(permission) ? children : fallback
}
