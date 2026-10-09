import { Link } from "react-router"

import { SidebarNav } from "@/components/layout/sidebar-nav"
import { SidebarUser } from "@/components/layout/sidebar-user"

type SidebarContentProps = {
  onNavigate?: () => void
}

/** Nội dung sidebar, dùng chung cho bản desktop (cố định) và mobile (sheet). */
export function SidebarContent({ onNavigate }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col gap-0.5 overflow-y-auto px-3 pt-[18px] pb-4">
      <Link to="/" onClick={onNavigate} className="block px-2.5 pb-[18px]">
        <img
          src="/logo.png"
          alt="Quầy Sức Khỏe"
          className="block h-auto w-[118px]"
        />
      </Link>
      <SidebarNav onNavigate={onNavigate} />
      <SidebarUser />
    </div>
  )
}
