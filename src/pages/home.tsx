import { Navigate } from "react-router"

import { PageHeader } from "@/components/layout/page-header"
import { PERMISSIONS } from "@/features/access/permissions"
import { usePermissions } from "@/features/access/use-permissions"
import { useCurrentUser } from "@/features/auth/hooks/use-auth"
import { usePermission } from "@/features/auth/hooks/use-permission"
import { displayName } from "@/features/auth/lib/user-display"

export function HomePage() {
  const { data: user } = useCurrentUser()
  const { can } = usePermissions()
  const canReadUsers = usePermission("users:read")

  // Nhân viên Midu không có quầy: chuyển sang trang quản trị thành viên.
  if (!can(PERMISSIONS.dashboardView) && canReadUsers) {
    return <Navigate to="/members" replace />
  }

  return (
    <>
      <div className="relative mb-5 flex flex-wrap items-center gap-[18px] overflow-hidden rounded-[18px] border border-[#D7E8F8] bg-linear-[100deg] from-[#E3F1FD] via-[#F1F8FE] to-white px-[26px] py-[22px]">
        <div className="size-12 shrink-0 rounded-full bg-[#FFC81E] shadow-[0_0_0_8px_rgba(255,200,30,.22),0_0_0_16px_rgba(255,200,30,.1)]" />
        <div className="min-w-0 flex-[1_1_240px]">
          <h1 className="text-[22px] font-bold text-brand">
            Xin chào {user ? displayName(user) : ""}
          </h1>
          <p className="mt-1 text-[13.5px] text-secondary-foreground">
            Chúc một ngày làm việc hiệu quả.
          </p>
        </div>
      </div>
      <PageHeader
        title="Tổng quan"
        description="Số liệu trong ngày sẽ hiện ở đây khi backend sẵn sàng."
      />
    </>
  )
}
