import { Link } from "react-router"

import { Button } from "@/components/ui/button"

export function ForbiddenPage() {
  return (
    <div className="grid place-items-center gap-3 rounded-[14px] border bg-card px-5 py-16 text-center">
      <b className="text-lg font-bold">
        Tài khoản chưa được cấp quyền xem mục này
      </b>
      <p className="max-w-md text-[13.5px] text-muted-foreground">
        Liên hệ quản trị để được cấp quyền, hoặc quay về trang tổng quan.
      </p>
      <Button asChild variant="outline" size="lg">
        <Link to="/">Về tổng quan</Link>
      </Button>
    </div>
  )
}
