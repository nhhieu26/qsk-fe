/**
 * Danh sách quyền của ứng dụng. Mỗi quyền là một chuỗi `<module>.<hành động>`.
 *
 * Backend sẽ trả về mảng quyền cho từng tài khoản (xem `resolvePermissions`),
 * frontend chỉ dùng để ẩn/hiện menu, nút, trang. Backend vẫn phải tự kiểm tra
 * quyền ở mọi API.
 *
 * Hỗ trợ wildcard khi cấp quyền: `*` (toàn quyền), `products.*` (mọi quyền sản phẩm).
 */
export const PERMISSIONS = {
  dashboardView: "dashboard.view",

  membersView: "members.view",
  measureView: "measure.view",
  classesView: "classes.view",
  consultView: "consult.view",

  salesView: "sales.view",
  salesCreate: "sales.create",
  ordersView: "orders.view",
  ordersUpdate: "orders.update",
  ordersCancel: "orders.cancel",
  cardsView: "cards.view",
  pointsView: "points.view",

  stockView: "stock.view",
  stockImport: "stock.import",
  stockAdjust: "stock.adjust",
  stockStocktake: "stock.stocktake",

  productsView: "products.view",
  productsCreate: "products.create",
  productsUpdate: "products.update",
  productsDocuments: "products.documents",

  portalView: "portal.view",
  franchiseView: "franchise.view",

  reportsView: "reports.view",
  logsView: "logs.view",
  settingsView: "settings.view",
  /** Sửa thông tin điểm và tài khoản nhận thanh toán. */
  settingsUpdate: "settings.update",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const WILDCARD = "*"
