export type Role = "superadmin" | "midu" | "agency" | "customer"

export type Permission = "profile:read" | "users:read" | "users:update-role"

export interface User {
  _id: string
  accountId: string
  shopId?: string
  phoneNumber: string
  fullName?: string
  email?: string
  role: Role
  /** Quyền quản trị (`Permission`); có thể kèm quyền quầy dạng `<module>.<hành động>`. */
  permissions: string[]
  lastLoginAt?: string
  createdAt: string
}
