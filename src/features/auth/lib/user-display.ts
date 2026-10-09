import type { User } from "@/features/auth/api/auth"
import { ROLE_LABELS } from "@/features/access/roles"

export function displayName(user: User): string {
  return user.fullName ?? user.phoneNumber
}

export function roleLabel(user: User): string {
  return ROLE_LABELS[user.role] ?? user.role
}
