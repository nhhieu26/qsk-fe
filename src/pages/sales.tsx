import { useState } from "react"
import { useNavigate } from "react-router"

import { EmptyState } from "@/components/common/empty-state"
import { PageError, PageLoading } from "@/components/common/query-state"
import { SearchInput } from "@/components/common/search-input"
import { PageHeader } from "@/components/layout/page-header"
import { PERMISSIONS } from "@/features/access/permissions"
import { usePermissions } from "@/features/access/use-permissions"
import { useProducts } from "@/features/products/hooks/use-products"
import { getMissingDocuments } from "@/features/products/lib/product-compliance"
import {
  filterProducts,
  type CategoryFilter,
} from "@/features/products/lib/product-filters"
import type { Product } from "@/features/products/types"
import {
  CartButton,
  CartFloatingBar,
} from "@/features/sales/components/cart-button"
import {
  CategoryNav,
  categoryNavOptions,
} from "@/features/sales/components/category-nav"
import { ProductCard } from "@/features/sales/components/product-card"
import { useCartStore } from "@/features/sales/store/cart-store"
import { notifySuccess, notifyWarning } from "@/lib/notify"

export function SalesPage() {
  const { data: products, isPending, error, refetch } = useProducts()
  const [category, setCategory] = useState<CategoryFilter>("all")
  const [query, setQuery] = useState("")

  return (
    <>
      <PageHeader
        title="Bán hàng"
        description="Chọn sản phẩm cho khách: thêm vào giỏ, hoặc bấm Mua ngay để đặt hàng luôn."
        actions={
          <>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Tìm theo tên sản phẩm..."
              className="h-[42px] w-full sm:w-[280px]"
            />
            <CartButton />
          </>
        }
      />
      {isPending ? (
        <PageLoading />
      ) : error ? (
        <PageError error={error} onRetry={() => void refetch()} />
      ) : (
        <Catalog
          products={products}
          category={category}
          onCategoryChange={setCategory}
          query={query}
        />
      )}
      <CartFloatingBar />
    </>
  )
}

type CatalogProps = {
  products: readonly Product[]
  category: CategoryFilter
  onCategoryChange: (value: CategoryFilter) => void
  query: string
}

function Catalog({
  products,
  category,
  onCategoryChange,
  query,
}: CatalogProps) {
  const navigate = useNavigate()
  const { can } = usePermissions()
  const cart = useCartStore((s) => s.cart)
  const addLine = useCartStore((s) => s.addLine)
  const startBuyNow = useCartStore((s) => s.startBuyNow)

  const options = categoryNavOptions(products)
  const current = options.find((o) => o.value === category) ?? options[0]
  const visible = filterProducts(products, {
    query,
    category,
    compliance: "all",
  })
  const canSell = can(PERMISSIONS.salesCreate)

  const warnIfMissingDocs = (p: Product) => {
    if (getMissingDocuments(p).length > 0)
      notifyWarning(`${p.name} đang thiếu giấy tờ, kiểm tra ở mục Sản phẩm`)
  }

  const handleAdd = (p: Product) => {
    warnIfMissingDocs(p)
    if (addLine("cart", { id: p.id, name: p.name, price: p.price }, p.stock))
      notifySuccess(`Đã thêm ${p.name} vào giỏ`)
    else notifyWarning("Không đủ tồn kho")
  }

  const handleBuyNow = (p: Product) => {
    warnIfMissingDocs(p)
    startBuyNow({ id: p.id, name: p.name, price: p.price })
    navigate("/sales/checkout?from=buy-now")
  }

  return (
    <div className="grid items-start gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
      <CategoryNav
        options={options}
        value={category}
        onChange={onCategoryChange}
      />
      <div className="min-w-0">
        <div className="mb-3.5 flex items-baseline gap-2.5">
          <h2 className="text-lg font-bold">{current?.label}</h2>
          <span className="text-[13px] text-muted-foreground">
            {visible.length} sản phẩm
          </span>
        </div>
        {visible.length === 0 ? (
          <EmptyState
            title={
              products.length > 0
                ? "Không tìm thấy sản phẩm"
                : "Chưa có sản phẩm"
            }
            description={
              products.length > 0
                ? 'Thử từ khoá khác hoặc chọn "Tất cả".'
                : "Vào mục Sản phẩm để thêm."
            }
          />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 pb-20">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                inCart={cart.find((l) => l.productId === p.id)?.quantity ?? 0}
                onAddToCart={canSell ? () => handleAdd(p) : undefined}
                onBuyNow={canSell ? () => handleBuyNow(p) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
