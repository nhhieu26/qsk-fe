import { Link } from "react-router"

import { StatusPill } from "@/components/common/status-pill"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CategoryTag } from "@/features/products/components/category-tag"
import type { Product } from "@/features/products/types"
import {
  getStockStatus,
  loanedQuantity,
} from "@/features/stock/lib/stock-status"
import { formatVnd } from "@/lib/format"
import { cn } from "@/lib/utils"

type StockTableProps = {
  products: readonly Product[]
  /** Không truyền = ẩn nút "Nhập thêm" (không có quyền). */
  onImport?: (product: Product) => void
}

const HEAD = "text-[11px] font-bold tracking-[.05em] text-[#1F4E86] uppercase"

export function StockTable({ products, onImport }: StockTableProps) {
  return (
    <Table className="text-[13px]">
      <TableHeader>
        <TableRow className="border-y border-[#D3E4F6] bg-[#EAF3FC] hover:bg-[#EAF3FC]">
          <TableHead className={cn(HEAD, "min-w-[200px] pl-[18px]")}>
            Tên mặt hàng &amp; quy cách
          </TableHead>
          <TableHead className={cn(HEAD, "hidden xl:table-cell")}>
            Phân loại
          </TableHead>
          <TableHead className={cn(HEAD, "hidden text-right xl:table-cell")}>
            Giá nhập
          </TableHead>
          <TableHead className={cn(HEAD, "text-right")}>Giá niêm yết</TableHead>
          <TableHead className={cn(HEAD, "text-center")}>Tồn thực tế</TableHead>
          <TableHead className={cn(HEAD, "text-center")}>
            Ngưỡng an toàn
          </TableHead>
          <TableHead className={HEAD}>Trạng thái</TableHead>
          <TableHead className={cn(HEAD, "w-[92px] pr-[18px] text-right")}>
            Thao tác
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <StockRow key={p.id} product={p} onImport={onImport} />
        ))}
      </TableBody>
    </Table>
  )
}

function StockRow({
  product: p,
  onImport,
}: {
  product: Product
  onImport?: (product: Product) => void
}) {
  const status = getStockStatus(p)
  const loaned = loanedQuantity(p)
  const sub = [
    p.registrationNo && `Số CB: ${p.registrationNo}`,
    p.shelfLife && `HSD: ${p.shelfLife}`,
    p.customerGroup,
  ].filter(Boolean)

  return (
    <TableRow className="hover:bg-surface-2">
      <TableCell className="py-3.5 pl-[18px] whitespace-normal">
        <Link
          to={`/stock/${p.id}`}
          className="text-sm leading-snug font-semibold text-foreground hover:text-primary"
        >
          {p.name}
        </Link>
        {sub.length > 0 && (
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            {sub.join(" · ")}
          </div>
        )}
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        <CategoryTag category={p.category} />
      </TableCell>
      <TableCell className="hidden text-right text-muted-foreground xl:table-cell">
        {p.costPrice ? formatVnd(p.costPrice) : "—"}
      </TableCell>
      <TableCell className="text-right font-bold text-primary">
        {formatVnd(p.price)}
      </TableCell>
      <TableCell className="text-center">
        <span
          className={cn(
            "text-[15px] font-bold text-foreground",
            p.stock <= 0
              ? "text-[#C2362F]"
              : p.stock <= p.threshold && "text-warning"
          )}
        >
          {p.stock}
        </span>
      </TableCell>
      <TableCell className="text-center">{p.threshold}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1.5">
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
          {loaned > 0 && (
            <StatusPill tone="violet">Cho mượn {loaned}</StatusPill>
          )}
        </div>
      </TableCell>
      <TableCell className="pr-[18px]">
        <div className="flex flex-col items-stretch gap-1">
          {onImport && (
            <button
              type="button"
              onClick={() => onImport(p)}
              className="h-7 rounded-lg bg-primary-soft px-2.5 text-xs font-semibold whitespace-nowrap text-primary"
            >
              Nhập thêm
            </button>
          )}
          <Link
            to={`/stock/${p.id}`}
            className="grid h-7 place-items-center rounded-lg border border-[#D9E0E8] bg-white px-2.5 text-xs font-semibold whitespace-nowrap text-secondary-foreground hover:border-primary hover:text-primary"
          >
            Thẻ kho
          </Link>
        </div>
      </TableCell>
    </TableRow>
  )
}
