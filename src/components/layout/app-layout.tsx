import { Outlet } from "react-router"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"

/** Khung chung sau đăng nhập: sidebar + header + vùng nội dung full chiều rộng. */
export function AppLayout() {
  return (
    <div className="flex min-h-svh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="w-full min-w-0 flex-1 px-4 pt-6 pb-20 sm:px-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
