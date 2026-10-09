import { createBrowserRouter } from "react-router"

import { AppLayout } from "@/components/layout/app-layout"
import { PERMISSIONS, type Permission } from "@/features/access/permissions"
import { RequirePermission } from "@/features/access/require-permission"
import { AdminLayout } from "@/components/layout/admin-layout"
import { RequireAuth } from "@/guards/require-auth"
import { RequirePermission as RequireAdminPermission } from "@/guards/require-permission"
import { AuthCallbackPage } from "@/pages/auth-callback"
import { ComingSoonPage } from "@/pages/coming-soon"
import { HomePage } from "@/pages/home"
import { LoginPage } from "@/pages/login"
import { MembersPage } from "@/pages/members"
import { OrderDetailPage } from "@/pages/order-detail"
import { OrdersPage } from "@/pages/orders"
import { ProductDetailPage } from "@/pages/product-detail"
import { ProductsPage } from "@/pages/products"
import { SalesPage } from "@/pages/sales"
import { SalesCartPage } from "@/pages/sales-cart"
import { SalesCheckoutPage } from "@/pages/sales-checkout"
import { StockPage } from "@/pages/stock"
import { StockCardPage } from "@/pages/stock-card"
import { SettingsPage } from "@/pages/settings"

function guarded(permission: Permission, page: React.ReactNode) {
  return <RequirePermission permission={permission}>{page}</RequirePermission>
}

export const router = createBrowserRouter([
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: guarded(PERMISSIONS.dashboardView, <HomePage />),
      },
      {
        path: "products",
        element: guarded(PERMISSIONS.productsView, <ProductsPage />),
      },
      {
        path: "products/:productId",
        element: guarded(PERMISSIONS.productsView, <ProductDetailPage />),
      },
      { path: "stock", element: guarded(PERMISSIONS.stockView, <StockPage />) },
      {
        path: "stock/:productId",
        element: guarded(PERMISSIONS.stockView, <StockCardPage />),
      },
      { path: "sales", element: guarded(PERMISSIONS.salesView, <SalesPage />) },
      {
        path: "sales/cart",
        element: guarded(PERMISSIONS.salesCreate, <SalesCartPage />),
      },
      {
        path: "sales/checkout",
        element: guarded(PERMISSIONS.salesCreate, <SalesCheckoutPage />),
      },
      {
        path: "orders",
        element: guarded(PERMISSIONS.ordersView, <OrdersPage />),
      },
      {
        path: "orders/:orderId",
        element: guarded(PERMISSIONS.ordersView, <OrderDetailPage />),
      },
      {
        path: "settings",
        element: guarded(PERMISSIONS.settingsView, <SettingsPage />),
      },
      // Mục menu chưa có giao diện + đường dẫn lạ.
      { path: "*", element: <ComingSoonPage /> },
    ],
  },
  {
    element: (
      <RequireAuth>
        <RequireAdminPermission permission="users:read">
          <AdminLayout />
        </RequireAdminPermission>
      </RequireAuth>
    ),
    children: [{ path: "/members", element: <MembersPage /> }],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
])
