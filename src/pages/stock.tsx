import { useState } from "react"
import { Plus } from "lucide-react"

import { PageError, PageLoading } from "@/components/common/query-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { PERMISSIONS } from "@/features/access/permissions"
import { usePermissions } from "@/features/access/use-permissions"
import { useProducts } from "@/features/products/hooks/use-products"
import type { Product } from "@/features/products/types"
import { ImportStockDialog } from "@/features/stock/components/import-stock-dialog"
import {
  LoansCard,
  type LoanEntry,
} from "@/features/stock/components/loans-card"
import { LowStockAlert } from "@/features/stock/components/low-stock-alert"
import { ReturnLoanDialog } from "@/features/stock/components/return-loan-dialog"
import {
  StockPanel,
  type StockPanelState,
} from "@/features/stock/components/stock-panel"
import { StockSummaryCards } from "@/features/stock/components/stock-summary-cards"
import { StocktakeDialog } from "@/features/stock/components/stocktake-dialog"
import { useStockMovements } from "@/features/stock/hooks/use-stock"
import { summarizeStock } from "@/features/stock/lib/stock-filters"
import { stockValue } from "@/features/stock/lib/stock-status"
import { formatVnd } from "@/lib/format"

const INITIAL_PANEL: StockPanelState = {
  view: "inventory",
  filter: "all",
  query: "",
  page: 1,
}

type ImportTarget = { productId?: string } | null

export function StockPage() {
  const products = useProducts()
  const movements = useStockMovements()
  const { can } = usePermissions()
  const [panel, setPanel] = useState(INITIAL_PANEL)
  const [importTarget, setImportTarget] = useState<ImportTarget>(null)
  const [isStocktaking, setIsStocktaking] = useState(false)
  const [returning, setReturning] = useState<LoanEntry>()

  const canImport = can(PERMISSIONS.stockImport)
  const canAdjust = can(PERMISSIONS.stockAdjust)

  if (products.isPending || movements.isPending) return <PageLoading />
  if (products.error || movements.error) {
    return (
      <PageError
        error={products.error ?? movements.error}
        onRetry={() =>
          void Promise.all([products.refetch(), movements.refetch()])
        }
      />
    )
  }

  const list = products.data
  const loans = list.flatMap((product) =>
    product.loans.map((loan) => ({ product, loan }))
  )
  const showInventory = (filter: StockPanelState["filter"]) =>
    setPanel({ ...INITIAL_PANEL, filter })

  return (
    <>
      <PageHeader
        breadcrumb="Hàng hoá / Kho"
        title="Quản lý Kho & Thẻ kho"
        description={
          <span className="flex flex-wrap items-baseline gap-2.5">
            Tổng giá trị tồn kho
            <b className="text-[22px] font-bold tracking-tight text-primary">
              {formatVnd(stockValue(list))}
            </b>
            <span>· tính theo giá nhập, chưa có thì theo giá bán</span>
          </span>
        }
        actions={
          <>
            {can(PERMISSIONS.stockStocktake) && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsStocktaking(true)}
              >
                Kiểm kê cả kho
              </Button>
            )}
            {canImport && (
              <Button size="lg" onClick={() => setImportTarget({})}>
                <Plus data-icon="inline-start" /> Nhập kho mới
              </Button>
            )}
          </>
        }
      />
      <LowStockAlert products={list} onViewAll={() => showInventory("below")} />
      <StockSummaryCards
        summary={summarizeStock(list, movements.data)}
        onSelectInventory={showInventory}
        onSelectMovements={() =>
          setPanel({ ...INITIAL_PANEL, view: "movements" })
        }
      />
      <StockPanel
        products={list}
        movements={movements.data}
        state={panel}
        onStateChange={setPanel}
        onImport={
          canImport
            ? (p: Product) => setImportTarget({ productId: p.id })
            : undefined
        }
      />
      {panel.view === "inventory" && (
        <LoansCard
          entries={loans}
          showProduct
          onReturn={canAdjust ? setReturning : undefined}
        />
      )}

      <ImportStockDialog
        open={importTarget !== null}
        onOpenChange={(open) => !open && setImportTarget(null)}
        products={list}
        productId={importTarget?.productId}
      />
      <StocktakeDialog
        open={isStocktaking}
        onOpenChange={setIsStocktaking}
        products={list}
      />
      <ReturnLoanDialog
        entry={returning}
        onClose={() => setReturning(undefined)}
      />
    </>
  )
}
