import { useState } from "react"
import { Link, useParams } from "react-router"
import { ArrowLeftRight, BarChart3, Box, Tag } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { PageError, PageLoading } from "@/components/common/query-state"
import { StatCard } from "@/components/common/stat-card"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { PERMISSIONS } from "@/features/access/permissions"
import { usePermissions } from "@/features/access/use-permissions"
import { useProduct } from "@/features/products/hooks/use-products"
import { AdjustStockDialog } from "@/features/stock/components/adjust-stock-dialog"
import { ImportStockDialog } from "@/features/stock/components/import-stock-dialog"
import {
  LoansCard,
  type LoanEntry,
} from "@/features/stock/components/loans-card"
import { MovementTable } from "@/features/stock/components/movement-table"
import { ReturnLoanDialog } from "@/features/stock/components/return-loan-dialog"
import { useStockMovements } from "@/features/stock/hooks/use-stock"
import { summarizeStock } from "@/features/stock/lib/stock-filters"
import { loanedQuantity } from "@/features/stock/lib/stock-status"
import { formatVnd } from "@/lib/format"

type OpenDialog = "import" | "adjust" | null

export function StockCardPage() {
  const { productId = "" } = useParams()
  const product = useProduct(productId)
  const movements = useStockMovements({ productId })
  const { can } = usePermissions()
  const [dialog, setDialog] = useState<OpenDialog>(null)
  const [returning, setReturning] = useState<LoanEntry>()

  if (product.isPending || movements.isPending) return <PageLoading />
  if (product.error || movements.error) {
    return (
      <PageError
        error={product.error ?? movements.error}
        onRetry={() => void product.refetch()}
      />
    )
  }

  const p = product.data
  const history = movements.data
  const monthSold = summarizeStock([p], history).monthSaleQuantity
  const canAdjust = can(PERMISSIONS.stockAdjust)
  const closeDialog = (open: boolean) => !open && setDialog(null)

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link to="/stock" className="hover:text-primary">
            Hàng hoá / Kho
          </Link>
        }
        title={`Thẻ kho · ${p.name}`}
        actions={
          <>
            <Button asChild variant="outline" size="lg">
              <Link to="/stock">Về kho</Link>
            </Button>
            {canAdjust && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDialog("adjust")}
              >
                Điều chỉnh tay
              </Button>
            )}
            {can(PERMISSIONS.stockImport) && (
              <Button size="lg" onClick={() => setDialog("import")}>
                Nhập kho
              </Button>
            )}
          </>
        }
      />
      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <StatCard
          label="Tồn hiện tại"
          value={p.stock}
          hint={`ngưỡng ${p.threshold}`}
          icon={Box}
          iconClassName="bg-primary-soft text-primary"
          valueClassName={p.stock <= p.threshold ? "text-warning" : undefined}
        />
        <StatCard
          label="Đang cho mượn"
          value={loanedQuantity(p)}
          hint={`${p.loans.length} lượt chưa trả`}
          icon={ArrowLeftRight}
          iconClassName="bg-violet-soft text-violet"
        />
        <StatCard
          label="Đã bán tháng này"
          value={monthSold}
          hint="lấy từ thẻ kho"
          icon={BarChart3}
          iconClassName="bg-success-soft text-success"
        />
        <StatCard
          label="Giá bán"
          value={formatVnd(p.price)}
          hint="mỗi đơn vị"
          icon={Tag}
          iconClassName="bg-warning-soft text-warning"
        />
      </div>
      <LoansCard
        entries={p.loans.map((loan) => ({ product: p, loan }))}
        onReturn={canAdjust ? setReturning : undefined}
      />
      <section className="mb-5 overflow-hidden rounded-2xl border bg-card shadow-xs">
        <h2 className="border-b px-[18px] py-3.5 text-base font-semibold">
          Lịch sử tồn kho · {history.length} lần thay đổi
        </h2>
        {history.length > 0 ? (
          <MovementTable movements={history} />
        ) : (
          <EmptyState title="Chưa có thay đổi nào" />
        )}
      </section>

      <ImportStockDialog
        open={dialog === "import"}
        onOpenChange={closeDialog}
        products={[p]}
        productId={p.id}
      />
      <AdjustStockDialog
        open={dialog === "adjust"}
        onOpenChange={closeDialog}
        product={p}
      />
      <ReturnLoanDialog
        entry={returning}
        onClose={() => setReturning(undefined)}
      />
    </>
  )
}
