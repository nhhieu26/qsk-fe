import { EmptyState } from "@/components/common/empty-state"
import { FilterChips } from "@/components/common/filter-chips"
import { paginate, Pagination } from "@/components/common/pagination"
import { SearchInput } from "@/components/common/search-input"
import { SegmentedControl } from "@/components/common/segmented-control"
import type { Product } from "@/features/products/types"
import { MovementTable } from "@/features/stock/components/movement-table"
import { StockTable } from "@/features/stock/components/stock-table"
import { MOVEMENT_PAGE_SIZE, STOCK_PAGE_SIZE } from "@/features/stock/constants"
import {
  filterInventory,
  filterMovements,
  matchesInventoryFilter,
  type InventoryFilter,
} from "@/features/stock/lib/stock-filters"
import type { StockMovement } from "@/features/stock/types"

export type StockView = "inventory" | "movements"

export type StockPanelState = {
  view: StockView
  filter: InventoryFilter
  query: string
  page: number
}

type StockPanelProps = {
  products: readonly Product[]
  movements: readonly StockMovement[]
  state: StockPanelState
  onStateChange: (state: StockPanelState) => void
  onImport?: (product: Product) => void
}

const FILTER_LABELS: readonly { value: InventoryFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "below", label: "Dưới ngưỡng" },
  { value: "out", label: "Hết hàng" },
  { value: "loaned", label: "Đang cho mượn" },
]

export function StockPanel({
  products,
  movements,
  state,
  onStateChange,
  onImport,
}: StockPanelProps) {
  const update = (patch: Partial<StockPanelState>) =>
    onStateChange({ ...state, page: 1, ...patch })
  const isInventory = state.view === "inventory"

  return (
    <section className="mb-5 overflow-hidden rounded-2xl border bg-card shadow-xs">
      <div className="flex flex-wrap items-center gap-3 border-b px-[18px] py-3.5">
        {isInventory ? (
          <FilterChips
            variant="solid"
            value={state.filter}
            onChange={(filter) => update({ filter })}
            options={FILTER_LABELS.map((f) => ({
              ...f,
              count: products.filter((p) => matchesInventoryFilter(p, f.value))
                .length,
            }))}
          />
        ) : (
          <div className="text-sm font-semibold">Lịch sử biến động kho</div>
        )}
        <div className="flex-1" />
        <SearchInput
          value={state.query}
          onChange={(query) => update({ query })}
          placeholder={
            isInventory
              ? "Tìm tên mặt hàng, số công bố..."
              : "Tìm mặt hàng, hoạt động, người làm..."
          }
          className="min-w-[200px] flex-[0_1_300px]"
        />
        <SegmentedControl
          value={state.view}
          onChange={(view) => update({ view })}
          options={[
            { value: "inventory", label: "Tồn kho" },
            { value: "movements", label: `Thẻ kho (${movements.length})` },
          ]}
        />
      </div>
      {isInventory ? (
        <InventoryView
          products={products}
          state={state}
          onImport={onImport}
          onPageChange={(page) => onStateChange({ ...state, page })}
        />
      ) : (
        <MovementsView
          movements={movements}
          state={state}
          onPageChange={(page) => onStateChange({ ...state, page })}
        />
      )}
    </section>
  )
}

type ViewProps = {
  state: StockPanelState
  onPageChange: (page: number) => void
}

function InventoryView({
  products,
  state,
  onImport,
  onPageChange,
}: ViewProps & {
  products: readonly Product[]
  onImport?: (product: Product) => void
}) {
  if (products.length === 0) return <EmptyState title="Chưa có sản phẩm nào" />
  const rows = filterInventory(products, state.filter, state.query)
  if (rows.length === 0)
    return <EmptyState title="Không có mặt hàng nào khớp" />
  const slice = paginate(rows.length, state.page, STOCK_PAGE_SIZE)

  return (
    <>
      <StockTable
        products={rows.slice(slice.from, slice.to)}
        onImport={onImport}
      />
      <Pagination
        total={rows.length}
        slice={slice}
        unitLabel="mặt hàng"
        onPageChange={onPageChange}
      />
    </>
  )
}

function MovementsView({
  movements,
  state,
  onPageChange,
}: ViewProps & { movements: readonly StockMovement[] }) {
  const rows = filterMovements(movements, state.query)
  if (rows.length === 0) return <EmptyState title="Chưa có biến động kho nào" />
  const slice = paginate(rows.length, state.page, MOVEMENT_PAGE_SIZE)

  return (
    <>
      <MovementTable movements={rows.slice(slice.from, slice.to)} showProduct />
      <Pagination
        total={rows.length}
        slice={slice}
        unitLabel="lần thay đổi"
        onPageChange={onPageChange}
      />
    </>
  )
}
