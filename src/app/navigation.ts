import {
  BarChart3,
  Boxes,
  CalendarCheck,
  CreditCard,
  History,
  LayoutGrid,
  MessageSquarePlus,
  ReceiptText,
  Ruler,
  Settings2,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react"

import { PERMISSIONS, type Permission } from "@/features/access/permissions"

export type NavItem = {
  path: string
  label: string
  icon: LucideIcon
  permission: Permission
  /** Mô tả ngắn hiện dưới tiêu đề trang. */
  description?: string
}

export type NavGroup = {
  id: string
  /** Tiêu đề nhóm trên sidebar; bỏ trống thì không hiện. */
  label?: string
  items: readonly NavItem[]
}

/**
 * Nguồn duy nhất cho menu sidebar. Thêm module mới: thêm item ở đây kèm quyền,
 * rồi khai báo route trong `router.tsx`. Item chưa có route sẽ hiện trang
 * "đang phát triển".
 */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    id: "overview",
    items: [
      {
        path: "/",
        label: "Tổng quan",
        icon: LayoutGrid,
        permission: PERMISSIONS.dashboardView,
      },
    ],
  },
  {
    id: "customers",
    label: "Khách hàng",
    items: [
      {
        path: "/members",
        label: "Hội viên",
        icon: Users,
        permission: PERMISSIONS.membersView,
        description: "Hồ sơ, thẻ và lịch sử của từng hội viên",
      },
      {
        path: "/measure",
        label: "Buổi đo",
        icon: Ruler,
        permission: PERMISSIONS.measureView,
        description: "Chọn hội viên để ghi chỉ số đo",
      },
      {
        path: "/classes",
        label: "Lớp vận động",
        icon: CalendarCheck,
        permission: PERMISSIONS.classesView,
        description: "Điểm danh và chốt buổi lớp trong ngày",
      },
      {
        path: "/consult",
        label: "Tư vấn bệnh án",
        icon: MessageSquarePlus,
        permission: PERMISSIONS.consultView,
        description: "Bệnh án, đơn thuốc hội viên gửi lên chờ tư vấn",
      },
    ],
  },
  {
    id: "sales",
    label: "Bán hàng",
    items: [
      {
        path: "/sales",
        label: "Bán hàng",
        icon: ShoppingCart,
        permission: PERMISSIONS.salesView,
        description: "Chọn sản phẩm, đặt hàng cho khách",
      },
      {
        path: "/orders",
        label: "Đơn hàng",
        icon: ReceiptText,
        permission: PERMISSIONS.ordersView,
        description: "Theo dõi thanh toán, giao hàng của từng đơn",
      },
      {
        path: "/cards",
        label: "Thẻ & gia hạn",
        icon: CreditCard,
        permission: PERMISSIONS.cardsView,
        description: "Bán thẻ, gia hạn và đối chiếu chuyển khoản",
      },
      {
        path: "/points",
        label: "Điểm Mi",
        icon: Sparkles,
        permission: PERMISSIONS.pointsView,
        description: "Tích điểm và dùng điểm của hội viên",
      },
    ],
  },
  {
    id: "goods",
    label: "Hàng hoá",
    items: [
      {
        path: "/stock",
        label: "Kho",
        icon: Boxes,
        permission: PERMISSIONS.stockView,
      },
      {
        path: "/products",
        label: "Sản phẩm",
        icon: Tag,
        permission: PERMISSIONS.productsView,
        description: "Danh mục sản phẩm và giấy tờ đi kèm",
      },
    ],
  },
  {
    id: "channels",
    label: "Kênh",
    items: [
      {
        path: "/portal",
        label: "Cửa hội viên",
        icon: Smartphone,
        permission: PERMISSIONS.portalView,
        description: "Xem hồ sơ như hội viên nhìn thấy",
      },
      {
        path: "/franchise",
        label: "Điểm quầy mẫu",
        icon: Store,
        permission: PERMISSIONS.franchiseView,
        description: "Ứng viên mở điểm quầy nhượng quyền",
      },
    ],
  },
  {
    id: "system",
    label: "Hệ thống",
    items: [
      {
        path: "/reports",
        label: "Báo cáo",
        icon: BarChart3,
        permission: PERMISSIONS.reportsView,
        description: "Số liệu kinh doanh theo tháng",
      },
      {
        path: "/logs",
        label: "Nhật ký",
        icon: History,
        permission: PERMISSIONS.logsView,
        description: "Các thao tác được ghi lại theo ngày",
      },
      {
        path: "/settings",
        label: "Cài đặt",
        icon: Settings2,
        permission: PERMISSIONS.settingsView,
        description: "Thông tin điểm, nhân sự và thanh toán",
      },
    ],
  },
]

export const NAV_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap((g) => g.items)

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) =>
    item.path === "/"
      ? pathname === "/"
      : pathname === item.path || pathname.startsWith(`${item.path}/`)
  )
}
