import { useState } from "react"
import { Link, useParams } from "react-router"

import { PageError, PageLoading } from "@/components/common/query-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { PERMISSIONS } from "@/features/access/permissions"
import { usePermissions } from "@/features/access/use-permissions"
import { ClaimsFormDialog } from "@/features/products/components/claims-form-dialog"
import { DocumentFormDialog } from "@/features/products/components/document-form-dialog"
import { ProductClaimsCard } from "@/features/products/components/product-claims-card"
import { ProductDocumentsCard } from "@/features/products/components/product-documents-card"
import { ProductFormDialog } from "@/features/products/components/product-form-dialog"
import { ProductInfoCard } from "@/features/products/components/product-info-card"
import { useProduct } from "@/features/products/hooks/use-products"

type OpenDialog = "edit" | "document" | "claims" | null

export function ProductDetailPage() {
  const { productId = "" } = useParams()
  const { data: product, isPending, error, refetch } = useProduct(productId)
  const { can } = usePermissions()
  const [dialog, setDialog] = useState<OpenDialog>(null)
  const closeDialog = (open: boolean) => !open && setDialog(null)

  if (isPending) return <PageLoading />
  if (error) return <PageError error={error} onRetry={() => void refetch()} />

  const canUpdate = can(PERMISSIONS.productsUpdate)
  const canManageDocs = can(PERMISSIONS.productsDocuments)

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link to="/products" className="hover:text-primary">
            Hàng hoá / Sản phẩm
          </Link>
        }
        title={product.name}
        actions={
          <>
            <Button asChild variant="outline" size="lg">
              <Link to="/products">Về danh mục</Link>
            </Button>
            {canUpdate && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDialog("edit")}
              >
                Sửa thông tin
              </Button>
            )}
            {canManageDocs && (
              <Button size="lg" onClick={() => setDialog("document")}>
                + Tải tài liệu
              </Button>
            )}
          </>
        }
      />
      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <ProductInfoCard product={product} />
        <ProductDocumentsCard product={product} canManage={canManageDocs} />
      </div>
      <ProductClaimsCard
        product={product}
        actions={
          canUpdate && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setDialog("claims")}
            >
              Sửa câu công dụng
            </Button>
          )
        }
      />

      <ProductFormDialog
        open={dialog === "edit"}
        onOpenChange={closeDialog}
        product={product}
      />
      <DocumentFormDialog
        open={dialog === "document"}
        onOpenChange={closeDialog}
        product={product}
      />
      <ClaimsFormDialog
        open={dialog === "claims"}
        onOpenChange={closeDialog}
        product={product}
      />
    </>
  )
}
