import { InfoRow, SectionCard } from "@/components/common/section-card"
import { Button } from "@/components/ui/button"
import type { Product, ProductLoan } from "@/features/products/types"
import { formatDate } from "@/lib/format"

export type LoanEntry = { product: Product; loan: ProductLoan }

type LoansCardProps = {
  entries: readonly LoanEntry[]
  /** Hiện tên sản phẩm trong mỗi dòng (trang tổng kho). */
  showProduct?: boolean
  /** Không truyền = ẩn nút "Nhận trả" (không có quyền). */
  onReturn?: (entry: LoanEntry) => void
}

export function LoansCard({
  entries,
  showProduct = false,
  onReturn,
}: LoansCardProps) {
  if (entries.length === 0) return null

  return (
    <SectionCard title={`Đang cho mượn chưa trả · ${entries.length} lượt`}>
      {entries.map((entry) => {
        const { product, loan } = entry
        const details = [
          `${loan.quantity} cái`,
          showProduct && loan.borrower,
          `từ ${formatDate(loan.date)}`,
          loan.note,
        ].filter(Boolean)
        return (
          <InfoRow
            key={loan.id}
            label={
              <>
                <span className="font-medium">
                  {showProduct ? product.name : loan.borrower}
                </span>{" "}
                <span className="text-[12.5px] text-muted-foreground">
                  {details.join(" · ")}
                </span>
              </>
            }
          >
            {onReturn && (
              <Button size="sm" onClick={() => onReturn(entry)}>
                Nhận trả
              </Button>
            )}
          </InfoRow>
        )
      })}
    </SectionCard>
  )
}
