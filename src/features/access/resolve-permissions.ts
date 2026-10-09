import type { User } from "@/features/auth/api/auth"
import { WILDCARD, type Permission } from "@/features/access/permissions"
import { ROLE_PERMISSIONS } from "@/features/access/roles"

/** Quyền thực tế: quyền backend cấp (`/auth/me`) cộng quyền quầy suy từ role. */
export function resolvePermissions(user: User): ReadonlySet<string> {
  return new Set([...user.permissions, ...(ROLE_PERMISSIONS[user.role] ?? [])])
}

export function hasPermission(
  granted: ReadonlySet<string>,
  permission: Permission
): boolean {
  if (granted.has(WILDCARD) || granted.has(permission)) return true
  const moduleName = permission.split(".")[0]
  return granted.has(`${moduleName}.${WILDCARD}`)
}
