import { formatAddress } from "@/features/customers/lib/customer-validation"
import { PAYMENT_METHODS, SHIPPING_METHODS } from "@/features/sales/constants"
import type { Order } from "@/features/sales/types"
import { formatDate, formatTime } from "@/lib/format"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === "") return null
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-2 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words text-foreground">{value}</dd>
    </div>
  )
}

function Group({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-b px-4 py-3 last:border-b-0">
      <h2 className="mb-1 text-[11px] font-bold tracking-[.06em] text-muted-foreground uppercase">
        {title}
      </h2>
      <dl className="text-[13px]">{children}</dl>
    </section>
  )
}

/** Khung bên phải trang chi tiết: người đặt, nhận hàng, hoá đơn gộp một chỗ. */
export function OrderInfoPanel({ order }: { order: Order }) {
  const { customer, shipping, invoice } = order
  const recipient = shipping.recipient
  const isCompany = invoice?.buyerType === "company"

  return (
    <aside className="overflow-hidden rounded-[14px] border bg-card shadow-xs">
      <Group title="Người đặt">
        <Row label="Họ tên" value={customer.name} />
        <Row
          label="SĐT"
          value={
            <a href={`tel:${customer.phone}`} className="hover:text-primary">
              {customer.phone}
            </a>
          }
        />
        <Row label="Email" value={customer.email} />
        <Row
          label="Thanh toán"
          value={PAYMENT_METHODS[order.paymentMethod].label}
        />
        {order.paidAt && (
          <Row
            label="Đã thu lúc"
            value={`${formatTime(order.paidAt)} ${formatDate(order.paidAt)}`}
          />
        )}
        <Row label="Ghi chú" value={order.note} />
      </Group>

      <Group title="Nhận hàng">
        <Row
          label="Hình thức"
          value={SHIPPING_METHODS[shipping.method].label}
        />
        {recipient && (
          <>
            <Row
              label="Người nhận"
              value={`${recipient.name} · ${recipient.phone}`}
            />
            <Row label="Địa chỉ" value={formatAddress(recipient.address)} />
          </>
        )}
        <Row label="Mã vận đơn" value={shipping.trackingCode} />
        <Row label="Ghi chú giao" value={shipping.note} />
      </Group>

      <Group title="Hoá đơn">
        {invoice ? (
          <>
            <Row
              label={isCompany ? "Đơn vị" : "Người mua"}
              value={invoice.buyerName}
            />
            <Row label="MST" value={invoice.taxCode} />
            <Row label="Địa chỉ" value={invoice.address} />
            <Row label="Email" value={invoice.email} />
          </>
        ) : (
          <p className="py-1 text-[13px] text-muted-foreground">
            Không xuất hoá đơn
          </p>
        )}
      </Group>
    </aside>
  )
}
