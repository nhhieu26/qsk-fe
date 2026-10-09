import { ArrowLeftRight, BarChart3, Box, TriangleAlert } from "lucide-react"

import { StatCard } from "@/components/common/stat-card"
import type {
  InventoryFilter,
  StockSummary,
} from "@/features/stock/lib/stock-filters"
import { formatVnd } from "@/lib/format"

type StockSummaryCardsProps = {
  summary: StockSummary
  onSelectInventory: (filter: InventoryFilter) => void
  onSelectMovements: () => void
}

export function StockSummaryCards({
  summary,
  onSelectInventory,
  onSelectMovements,
}: StockSummaryCardsProps) {
  return (
    <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      <StatCard
        label="Mặt hàng hoạt động"
        value={summary.totalProducts}
        hint={`${summary.inStock} mặt hàng còn tồn`}
        icon={Box}
        iconClassName="bg-primary-soft text-primary"
        onClick={() => onSelectInventory("all")}
      />
      <StatCard
        label="Dưới ngưỡng an toàn"
        value={summary.below}
        hint={`${summary.out} mặt hàng đã hết`}
        icon={TriangleAlert}
        iconClassName="bg-warning-soft text-warning"
        valueClassName="text-warning"
        onClick={() => onSelectInventory("below")}
      />
      <StatCard
        label="Cho mượn chưa hoàn"
        value={summary.loanCount}
        hint={`${summary.loanedProducts} mặt hàng đang cho mượn`}
        icon={ArrowLeftRight}
        iconClassName="bg-violet-soft text-violet"
        onClick={() => onSelectInventory("loaned")}
      />
      <StatCard
        label="Xuất bán tháng này"
        value={formatVnd(summary.monthSaleAmount)}
        hint={`${summary.monthSaleQuantity} đơn vị theo thẻ kho`}
        icon={BarChart3}
        iconClassName="bg-success-soft text-success"
        onClick={onSelectMovements}
      />
    </div>
  )
}
