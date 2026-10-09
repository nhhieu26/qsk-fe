import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import type { Product } from "@/features/products/types"

const PREVIEW_COUNT = 3

type LowStockAlertProps = {
  products: readonly Product[]
  onViewAll: () => void
}

export function LowStockAlert({ products, onViewAll }: LowStockAlertProps) {
  const below = products.filter((p) => p.stock <= p.threshold)
  if (below.length === 0) return null

  const outCount = below.filter((p) => p.stock <= 0).length
  const preview = [...below]
    .sort((a, b) => a.stock - b.stock)
    .slice(0, PREVIEW_COUNT)
  const rest = below.length - preview.length

  return (
    <AlertBanner
      title={`Cảnh báo tồn kho dưới ngưỡng an toàn (${below.length} mặt hàng${outCount ? `, ${outCount} đã hết` : ""})`}
      action={
        <Button variant="outline" size="sm" onClick={onViewAll}>
          Xem danh sách
        </Button>
      }
    >
      Cần nhập thêm:{" "}
      {preview.map((p, i) => (
        <span key={p.id}>
          {i > 0 && ", "}
          <strong className="text-warning">{p.name}</strong> (còn {p.stock})
        </span>
      ))}
      {rest > 0 ? ` và ${rest} mặt hàng khác.` : "."}
    </AlertBanner>
  )
}
