import { useNavigate } from "react-router"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MOVEMENT_TYPES } from "@/features/stock/constants"
import type { StockMovement } from "@/features/stock/types"
import { formatDate, formatTime } from "@/lib/format"
import { cn } from "@/lib/utils"

type MovementTableProps = {
  movements: readonly StockMovement[]
  /** Hiện cột mặt hàng + bấm dòng mở thẻ kho (dùng ở trang tổng kho). */
  showProduct?: boolean
}

const HEAD = "text-[11px] font-bold tracking-[.05em] text-[#1F4E86] uppercase"

function QuantityChange({ quantity }: { quantity: number }) {
  const sign = quantity > 0 ? "+" : quantity < 0 ? "−" : ""
  return (
    <span
      className={cn(
        "font-bold",
        quantity < 0
          ? "text-[#C2362F]"
          : quantity > 0
            ? "text-success"
            : "text-muted-foreground"
      )}
    >
      {sign}
      {Math.abs(quantity)}
    </span>
  )
}

export function MovementTable({
  movements,
  showProduct = false,
}: MovementTableProps) {
  const navigate = useNavigate()

  return (
    <Table className="text-[13px]">
      <TableHeader>
        <TableRow className="border-y border-[#D3E4F6] bg-[#EAF3FC] hover:bg-[#EAF3FC]">
          <TableHead className={cn(HEAD, "pl-[18px]")}>Thời gian</TableHead>
          {showProduct && <TableHead className={HEAD}>Mặt hàng</TableHead>}
          <TableHead className={HEAD}>Hoạt động</TableHead>
          {!showProduct && (
            <TableHead className={cn(HEAD, "text-center")}>Trước</TableHead>
          )}
          <TableHead className={cn(HEAD, "text-center")}>Thay đổi</TableHead>
          <TableHead className={cn(HEAD, "text-center")}>Còn lại</TableHead>
          <TableHead className={HEAD}>Người thực hiện</TableHead>
          <TableHead className={cn(HEAD, "pr-[18px]")}>Ghi chú</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((m) => (
          <TableRow
            key={m.id}
            className={cn(
              "hover:bg-surface-2",
              showProduct && "cursor-pointer"
            )}
            onClick={
              showProduct ? () => navigate(`/stock/${m.productId}`) : undefined
            }
          >
            <TableCell className="py-3 pl-[18px]">
              <div className="font-medium text-foreground">
                {formatDate(m.createdAt)}
              </div>
              <div className="text-[11.5px] text-muted-foreground">
                {formatTime(m.createdAt)}
              </div>
            </TableCell>
            {showProduct && (
              <TableCell className="font-semibold whitespace-normal text-foreground">
                {m.productName}
              </TableCell>
            )}
            <TableCell className="whitespace-normal">
              {MOVEMENT_TYPES[m.type].label}
              {m.counterparty && (
                <div className="text-[11.5px] text-muted-foreground">
                  {m.counterparty}
                </div>
              )}
            </TableCell>
            {!showProduct && (
              <TableCell className="text-center">{m.before}</TableCell>
            )}
            <TableCell className="text-center">
              <QuantityChange quantity={m.quantity} />
            </TableCell>
            <TableCell className="text-center font-semibold text-foreground">
              {m.after}
            </TableCell>
            <TableCell>{m.actor}</TableCell>
            <TableCell className="pr-[18px] text-[11.5px] whitespace-normal text-muted-foreground">
              {m.reason ?? m.reference}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
