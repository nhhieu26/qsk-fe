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
import { formatAddress } from "@/features/customers/lib/customer-validation"
import { OrderNoteCell } from "@/features/sales/components/order/order-note-cell"
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SHIPPING_METHODS,
} from "@/features/sales/constants"
import type { Order } from "@/features/sales/types"
import { formatDate, formatTime, formatVnd } from "@/lib/format"
import { cn } from "@/lib/utils"

const HEAD = "text-[11px] font-bold tracking-[.05em] text-[#1F4E86] uppercase"

type OrdersTableProps = {
  orders: readonly Order[]
  canEditNote: boolean
}

export function OrdersTable({ orders, canEditNote }: OrdersTableProps) {
  return (
    <Table className="text-[13px]">
      <TableHeader>
        <TableRow className="border-y border-[#D3E4F6] bg-[#EAF3FC] hover:bg-[#EAF3FC]">
          <TableHead className={cn(HEAD, "pl-[18px]")}>Mã đơn</TableHead>
          <TableHead className={HEAD}>Ngày đặt</TableHead>
          <TableHead className={HEAD}>Khách hàng</TableHead>
          <TableHead className={HEAD}>Số điện thoại</TableHead>
          <TableHead className={cn(HEAD, "min-w-[220px]")}>Địa chỉ</TableHead>
          <TableHead className={HEAD}>Thanh toán</TableHead>
          <TableHead className={HEAD}>Vận chuyển</TableHead>
          <TableHead className={cn(HEAD, "text-right")}>Tổng tiền</TableHead>
          <TableHead className={HEAD}>Trạng thái</TableHead>
          <TableHead className={cn(HEAD, "pr-[18px]")}>Ghi chú</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((o) => (
          <OrderRow key={o.id} order={o} canEditNote={canEditNote} />
        ))}
      </TableBody>
    </Table>
  )
}

function OrderRow({
  order: o,
  canEditNote,
}: {
  order: Order
  canEditNote: boolean
}) {
  const recipient = o.shipping.recipient
  const status = ORDER_STATUSES[o.status]
  const payment = PAYMENT_STATUSES[o.paymentStatus]

  return (
    <TableRow className="align-top hover:bg-surface-2">
      <TableCell className="py-3 pl-[18px]">
        <Link
          to={`/orders/${o.id}`}
          className="font-semibold text-foreground hover:text-primary"
        >
          {o.code}
        </Link>
      </TableCell>
      <TableCell className="py-3">
        <div className="font-medium text-foreground">
          {formatDate(o.createdAt)}
        </div>
        <div className="text-[11.5px] text-muted-foreground">
          {formatTime(o.createdAt)}
        </div>
      </TableCell>
      <TableCell className="py-3 whitespace-normal">
        <div className="font-medium text-foreground">{o.customer.name}</div>
        {recipient && recipient.name !== o.customer.name && (
          <div className="text-[11.5px] text-muted-foreground">
            Nhận: {recipient.name}
          </div>
        )}
      </TableCell>
      <TableCell className="py-3">
        <a
          href={`tel:${o.customer.phone}`}
          className="tabular-nums hover:text-primary"
        >
          {o.customer.phone}
        </a>
      </TableCell>
      <TableCell className="py-3 whitespace-normal text-secondary-foreground">
        {recipient ? (
          formatAddress(recipient.address)
        ) : (
          <span className="text-muted-foreground">Nhận tại quầy</span>
        )}
      </TableCell>
      <TableCell className="py-3">
        <div className="mb-1">{PAYMENT_METHODS[o.paymentMethod].label}</div>
        <StatusPill
          tone={payment.tone}
          withDot={false}
          className="px-2 py-0.5 text-[11px]"
        >
          {payment.label}
        </StatusPill>
      </TableCell>
      <TableCell className="py-3">
        {SHIPPING_METHODS[o.shipping.method].label}
        {o.shipping.trackingCode && (
          <div className="text-[11.5px] text-muted-foreground tabular-nums">
            {o.shipping.trackingCode}
          </div>
        )}
      </TableCell>
      <TableCell className="py-3 text-right font-bold text-foreground">
        {formatVnd(o.totals.total)}
      </TableCell>
      <TableCell className="py-3">
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </TableCell>
      <TableCell className="py-2 pr-[18px] whitespace-normal">
        <OrderNoteCell order={o} canEdit={canEditNote} />
      </TableCell>
    </TableRow>
  )
}
