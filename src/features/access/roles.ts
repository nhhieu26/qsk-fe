import { PERMISSIONS, WILDCARD } from "@/features/access/permissions"
import type { Role } from "@/types/user"

export const ROLE_LABELS: Readonly<Record<Role, string>> = {
  superadmin: "Quản trị",
  midu: "Nhân viên Midu",
  agency: "Đại lý",
  customer: "Chủ quầy",
}

const OWNER_PERMISSIONS: readonly string[] = Object.values(PERMISSIONS)

/**
 * Quyền quầy theo role, khớp backend/src/modules/access/access.permissions.ts.
 * Mọi tài khoản SSO mới đều là `customer` nên tạm cho đủ quyền chủ quầy;
 * `midu` (nhân viên công ty) chỉ dùng trang quản trị thành viên.
 */
export const ROLE_PERMISSIONS: Readonly<Record<Role, readonly string[]>> = {
  superadmin: [WILDCARD],
  midu: [],
  agency: OWNER_PERMISSIONS,
  customer: OWNER_PERMISSIONS,
}
