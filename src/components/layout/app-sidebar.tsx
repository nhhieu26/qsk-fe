import { SidebarContent } from "@/components/layout/sidebar-content"

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-[256px] shrink-0 border-r border-sidebar-border bg-sidebar lg:block print:hidden">
      <SidebarContent />
    </aside>
  )
}
