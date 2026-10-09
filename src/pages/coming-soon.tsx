import { Link, useLocation } from "react-router"

import { findNavItem } from "@/app/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { RequirePermission } from "@/features/access/require-permission"

/** Trang cho mục menu đã khai báo nhưng chưa có giao diện, hoặc đường dẫn lạ. */
export function ComingSoonPage() {
  const { pathname } = useLocation()
  const item = findNavItem(pathname)

  if (!item) {
    return (
      <div className="grid place-items-center gap-3 rounded-[14px] border bg-card px-5 py-16 text-center">
        <b className="text-lg font-bold">Không tìm thấy trang</b>
        <Button asChild variant="outline" size="lg">
          <Link to="/">Về tổng quan</Link>
        </Button>
      </div>
    )
  }

  return (
    <RequirePermission permission={item.permission}>
      <PageHeader title={item.label} description={item.description} />
      <div className="rounded-[14px] border bg-card px-5 py-16 text-center text-[13.5px] text-muted-foreground">
        <b className="mb-1 block text-[15px] font-semibold text-foreground">
          Đang phát triển
        </b>
        Mục này sẽ có khi backend sẵn sàng.
      </div>
    </RequirePermission>
  )
}
