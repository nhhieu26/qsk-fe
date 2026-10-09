import { useState } from "react"
import { Plus } from "lucide-react"

import { AlertBanner } from "@/components/common/alert-banner"
import { EmptyState } from "@/components/common/empty-state"
import { PageError, PageLoading } from "@/components/common/query-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Can } from "@/features/access/can"
import { PERMISSIONS } from "@/features/access/permissions"
import { ProductFilters } from "@/features/products/components/product-filters"
import { ProductFormDialog } from "@/features/products/components/product-form-dialog"
import { ProductTable } from "@/features/products/components/product-table"
import { useProducts } from "@/features/products/hooks/use-products"
import {
  documentLabel,
  getExpiringDocuments,
  getMissingDocuments,
} from "@/features/products/lib/product-compliance"
import {
  filterProducts,
  type ProductFilterState,
} from "@/features/products/lib/product-filters"
import type { Product } from "@/features/products/types"

const INITIAL_FILTER: ProductFilterState = {
  query: "",
  category: "all",
  compliance: "all",
}

export function ProductsPage() {
  const { data: products, isPending, error, refetch } = useProducts()
  const [filter, setFilter] = useState(INITIAL_FILTER)
  const [isCreating, setIsCreating] = useState(false)

  return (
    <>
      <PageHeader
        title="Sản phẩm và hồ sơ"
        description="Danh mục sản phẩm và giấy tờ đi kèm"
        actions={
          <Can permission={PERMISSIONS.productsCreate}>
            <Button size="lg" onClick={() => setIsCreating(true)}>
              <Plus data-icon="inline-start" /> Sản phẩm
            </Button>
          </Can>
        }
      />
      {isPending ? (
        <PageLoading />
      ) : error ? (
        <PageError error={error} onRetry={() => void refetch()} />
      ) : (
        <ProductsContent
          products={products}
          filter={filter}
          onFilterChange={setFilter}
        />
      )}
      <ProductFormDialog open={isCreating} onOpenChange={setIsCreating} />
    </>
  )
}

type ProductsContentProps = {
  products: readonly Product[]
  filter: ProductFilterState
  onFilterChange: (filter: ProductFilterState) => void
}

function ProductsContent({
  products,
  filter,
  onFilterChange,
}: ProductsContentProps) {
  const missingCount = products.filter(
    (p) => getMissingDocuments(p).length > 0
  ).length
  const expiring = getExpiringDocuments(products)
  const visible = filterProducts(products, filter)

  return (
    <>
      {missingCount > 0 && (
        <AlertBanner
          tone="danger"
          title={`${missingCount} mặt hàng chưa đủ giấy tờ.`}
        />
      )}
      {expiring.length > 0 && (
        <AlertBanner title="Giấy sắp hết hạn">
          {expiring
            .map(
              (e) =>
                `${e.product.name}: ${documentLabel(e.type, e.product)} còn ${e.daysLeft} ngày`
            )
            .join(" · ")}
        </AlertBanner>
      )}
      <ProductFilters
        products={products}
        value={filter}
        onChange={onFilterChange}
      />
      <section className="overflow-hidden rounded-[14px] border bg-card shadow-xs">
        {visible.length > 0 ? (
          <ProductTable products={visible} />
        ) : (
          <EmptyState
            title={
              products.length > 0
                ? "Không có sản phẩm nào khớp"
                : "Chưa có sản phẩm"
            }
            description={
              products.length > 0 ? "Đổi từ khoá hoặc bỏ bộ lọc." : undefined
            }
          />
        )}
      </section>
      <p className="mt-3 text-[12.5px] text-muted-foreground">
        {visible.length} trên {products.length} sản phẩm
      </p>
    </>
  )
}
