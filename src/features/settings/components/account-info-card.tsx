import { InfoRow, SectionCard } from "@/components/common/section-card"
import type { User } from "@/features/auth/api/auth"
import { displayName, roleLabel } from "@/features/auth/lib/user-display"

/** Tài khoản đang đăng nhập (MIDU SSO). Chỉ xem: thông tin quản lý ở MIDU Auth. */
export function AccountInfoCard({ user }: { user: User }) {
  const rows: readonly [string, string][] = [
    ["Họ tên", displayName(user)],
    ["Số điện thoại", user.phoneNumber],
    ["Email", user.email ?? "chưa có"],
    ["Vai trò", roleLabel(user) || "chưa được cấp quyền"],
    ["Mã quầy", user.shopId ?? "chưa gắn quầy"],
  ]

  return (
    <SectionCard title="Thông tin tài khoản">
      {rows.map(([label, value]) => (
        <InfoRow
          key={label}
          label={<span className="font-normal">{label}</span>}
        >
          <span className="font-bold break-all text-foreground">{value}</span>
        </InfoRow>
      ))}
      <p className="mt-3 text-xs text-muted-foreground">
        Đăng nhập bằng tài khoản MIDU. Đổi tên, số điện thoại, mật khẩu tại hệ
        thống MIDU.
      </p>
    </SectionCard>
  )
}
