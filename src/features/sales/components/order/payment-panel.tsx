import { QRCodeSVG } from "qrcode.react"
import { Copy, ExternalLink, Printer, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePaymentInfo } from "@/features/sales/hooks/use-orders"
import { buildPaymentMessage } from "@/features/sales/lib/payment-message"
import { buildVietQrPayload } from "@/features/sales/lib/vietqr"
import type { Order, PaymentInfo } from "@/features/sales/types"
import { copyText, shareText } from "@/lib/clipboard"
import { formatVnd } from "@/lib/format"
import { cn } from "@/lib/utils"

const QR_SIZE = 140

function qrPayloadOf(info: PaymentInfo): string {
  return (
    info.qrPayload ??
    buildVietQrPayload({
      bankBin: info.bankBin,
      accountNumber: info.accountNumber,
      amount: info.amount,
      content: info.transferContent,
    })
  )
}

/** Thông tin chuyển khoản gửi khách: QR, số tài khoản, tin nhắn, in phiếu. */
export function PaymentPanel({ order }: { order: Order }) {
  const { data: info, isPending, error } = usePaymentInfo(order.id, true)

  if (isPending) return <Skeleton className="h-44 w-full rounded-[14px]" />
  if (error) {
    return (
      <p className="rounded-[14px] border bg-card px-4 py-3 text-[13px] text-destructive">
        Không tải được thông tin thanh toán: {error.message}
      </p>
    )
  }

  const message = buildPaymentMessage(order, info)

  return (
    <section className="rounded-[14px] border border-[#BFD9F3] bg-primary-soft/40 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="flex-1 text-[15px] font-bold">Chờ khách chuyển khoản</h2>
        <div className="flex flex-wrap gap-1.5 print:hidden">
          <Button
            size="sm"
            onClick={() =>
              void copyText(
                message,
                "Đã chép tin nhắn, dán vào Zalo/SMS gửi khách"
              )
            }
          >
            <Copy data-icon="inline-start" /> Chép tin nhắn
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void shareText(`Đơn ${order.code}`, message)}
          >
            <Share2 data-icon="inline-start" /> Chia sẻ
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer data-icon="inline-start" /> In
          </Button>
          {info.paymentUrl && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={info.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink data-icon="inline-start" /> Link
              </a>
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-4">
        <figure className="shrink-0 rounded-lg border bg-white p-2">
          <QRCodeSVG
            value={qrPayloadOf(info)}
            size={QR_SIZE}
            level="M"
            marginSize={1}
            title={`VietQR đơn ${info.orderCode}`}
          />
        </figure>
        <dl className="min-w-[220px] flex-1 text-[13px]">
          <CopyRow label="Ngân hàng" value={info.bankName} />
          <CopyRow label="Số tài khoản" value={info.accountNumber} copyable />
          <CopyRow label="Chủ tài khoản" value={info.accountName} />
          <CopyRow
            label="Số tiền"
            value={formatVnd(info.amount)}
            copyValue={String(info.amount)}
            copyable
            emphasize
          />
          <CopyRow
            label="Nội dung CK"
            value={info.transferContent}
            copyable
            emphasize
          />
        </dl>
      </div>
    </section>
  )
}

type CopyRowProps = {
  label: string
  value: string
  copyValue?: string
  copyable?: boolean
  emphasize?: boolean
}

function CopyRow({
  label,
  value,
  copyValue,
  copyable = false,
  emphasize = false,
}: CopyRowProps) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "min-w-0 flex-1 font-semibold tabular-nums",
          emphasize && "text-primary"
        )}
      >
        {value}
      </dd>
      {copyable && (
        <button
          type="button"
          aria-label={`Chép ${label.toLowerCase()}`}
          onClick={() =>
            void copyText(copyValue ?? value, `Đã chép ${label.toLowerCase()}`)
          }
          className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-white hover:text-primary print:hidden"
        >
          <Copy className="size-3.5" />
        </button>
      )}
    </div>
  )
}
