import { useMemo } from "react"

import type { Permission } from "@/features/access/permissions"
import {
  hasPermission,
  resolvePermissions,
} from "@/features/access/resolve-permissions"
import { useCurrentUser } from "@/features/auth/hooks/use-auth"

export type PermissionCheck = {
  can: (permission: Permission) => boolean
  canAny: (permissions: readonly Permission[]) => boolean
}

const EMPTY: ReadonlySet<string> = new Set()

export function usePermissions(): PermissionCheck {
  const { data: user } = useCurrentUser()

  return useMemo(() => {
    const granted = user ? resolvePermissions(user) : EMPTY
    const can = (permission: Permission) => hasPermission(granted, permission)
    return {
      can,
      canAny: (permissions) => permissions.some(can),
    }
  }, [user])
}
