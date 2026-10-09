import type { OrderTotals } from "@/features/sales/types"
import { formatNumber, formatVnd } from "@/lib/format"
import { cn } from "@/lib/utils"

type OrderTotalsSummaryProps = {
  totals: OrderTotals
  /** Hiện dòng tích điểm (khi có khách hội viên). */
  showEarnedPoints?: boolean
  /** Chữ tổng nhỏ hơn, dùng ở trang chi tiết đơn. */
  compact?: boolean
}

export function OrderTotalsSummary({
  totals,
  showEarnedPoints = false,
  compact = false,
}: OrderTotalsSummaryProps) {
  return (
    <dl className="grid gap-1.5 text-[13.5px] text-secondary-foreground">
      <Row label="Tạm tính" value={formatVnd(totals.subtotal)} />
      <Row
        label="Phí vận chuyển"
        value={
          totals.shippingFee === 0 ? "Miễn phí" : formatVnd(totals.shippingFee)
        }
      />
      {totals.pointsDiscount > 0 && (
        <Row
          label="Điểm Mi sử dụng"
          value={`−${formatVnd(totals.pointsDiscount)}`}
          valueClassName="text-danger"
        />
      )}
      <div className="mt-2 flex items-baseline justify-between gap-2.5 border-t border-dashed pt-2.5">
        <dt className="text-sm font-semibold text-foreground">
          Tổng thanh toán
        </dt>
        <dd
          className={cn(
            "font-bold tracking-tight text-foreground tabular-nums",
            compact ? "text-xl" : "text-[26px]"
          )}
        >
          {formatVnd(totals.total)}
        </dd>
      </div>
      {showEarnedPoints && totals.earnedPoints > 0 && (
        <p className="text-right text-xs text-success">
          Tích sau khi hoàn tất: +{formatNumber(totals.earnedPoints)} điểm Mi
        </p>
      )}
    </dl>
  )
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <dt>{label}</dt>
      <dd className={valueClassName ?? "tabular-nums"}>{value}</dd>
    </div>
  )
}
