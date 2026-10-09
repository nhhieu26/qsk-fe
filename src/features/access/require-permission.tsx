import type { Permission } from "@/features/access/permissions"
import { usePermissions } from "@/features/access/use-permissions"
import { ForbiddenPage } from "@/pages/forbidden"

type RequirePermissionProps = {
  permission: Permission
  children: React.ReactNode
}

/** Guard cho route: không có quyền thì hiện trang 403 ngay trong layout. */
export function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const { can } = usePermissions()
  return can(permission) ? children : <ForbiddenPage />
}
