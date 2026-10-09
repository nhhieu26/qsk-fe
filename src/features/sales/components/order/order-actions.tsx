import { useState } from "react"

import { Button } from "@/components/ui/button"
import { PERMISSIONS } from "@/features/access/permissions"
import { usePermissions } from "@/features/access/use-permissions"
import { TextInputDialog } from "@/features/sales/components/order/text-input-dialog"
import { SHIPPING_METHODS } from "@/features/sales/constants"
import {
  useApproveOrder,
  useCancelOrder,
  useCompleteOrder,
  useHandOverOrder,
  useMarkPaid,
  useMarkReady,
  useMarkShipping,
} from "@/features/sales/hooks/use-orders"
import { availableActions } from "@/features/sales/lib/order-workflow"
import type { Order } from "@/features/sales/types"
import { formatVnd } from "@/lib/format"
import { notifyError, notifySuccess } from "@/lib/notify"

type OpenDialog = "handOver" | "cancel" | null

export function OrderActions({ order }: { order: Order }) {
  const { can } = usePermissions()
  const [dialog, setDialog] = useState<OpenDialog>(null)
  const markPaid = useMarkPaid(order.id)
  const approve = useApproveOrder(order.id)
  const handOver = useHandOverOrder(order.id)
  const markShipping = useMarkShipping(order.id)
  const markReady = useMarkReady(order.id)
  const complete = useCompleteOrder(order.id)
  const cancel = useCancelOrder(order.id)

  const actions = availableActions(order)
  const canUpdate = can(PERMISSIONS.ordersUpdate)
  const canCancel = can(PERMISSIONS.ordersCancel) && actions.canCancel
  const carrier = SHIPPING_METHODS[order.shipping.method].label
  const closeDialog = (open: boolean) => !open && setDialog(null)

  const done = (message: string) => ({
    onSuccess: () => {
      notifySuccess(message)
      setDialog(null)
    },
    onError: (error: Error) => notifyError(error),
  })

  const confirmThen = (question: string, run: () => void) => {
    if (window.confirm(question)) run()
  }

  return (
    <>
      {canUpdate && actions.canMarkPaid && (
        <Button
          variant="outline"
          size="lg"
          disabled={markPaid.isPending}
          onClick={() =>
            confirmThen(
              `Xác nhận đã nhận đủ ${formatVnd(order.totals.total)} cho đơn ${order.code}?`,
              () => markPaid.mutate(undefined, done("Đã xác nhận thanh toán"))
            )
          }
        >
          Xác nhận đã thu tiền
        </Button>
      )}
      {canUpdate && actions.canApprove && (
        <Button
          size="lg"
          disabled={approve.isPending}
          onClick={() => approve.mutate(undefined, done("Đã duyệt đơn"))}
        >
          Duyệt đơn
        </Button>
      )}
      {canUpdate && actions.canHandOver && (
        <Button size="lg" onClick={() => setDialog("handOver")}>
          Bàn giao {carrier}
        </Button>
      )}
      {canUpdate && actions.canMarkShipping && (
        <Button
          size="lg"
          disabled={markShipping.isPending}
          onClick={() =>
            markShipping.mutate(undefined, done("Đơn đang được giao"))
          }
        >
          {carrier} đã lấy hàng
        </Button>
      )}
      {canUpdate && actions.canMarkReady && (
        <Button
          size="lg"
          disabled={markReady.isPending}
          onClick={() =>
            markReady.mutate(undefined, done("Đã báo, chờ khách đến nhận"))
          }
        >
          Hàng đã sẵn sàng tại quầy
        </Button>
      )}
      {canUpdate && actions.canComplete && (
        <Button
          size="lg"
          disabled={complete.isPending}
          onClick={() =>
            confirmThen(
              `Hoàn tất đơn ${order.code}? Khách sẽ được tích điểm.`,
              () => complete.mutate(undefined, done("Đơn đã hoàn thành"))
            )
          }
        >
          {order.shipping.method === "pickup"
            ? "Khách đã nhận hàng"
            : "Đã giao thành công"}
        </Button>
      )}
      {canCancel && (
        <Button
          variant="destructive"
          size="lg"
          onClick={() => setDialog("cancel")}
        >
          Huỷ đơn
        </Button>
      )}

      <TextInputDialog
        open={dialog === "handOver"}
        onOpenChange={closeDialog}
        title={`Bàn giao ${carrier}`}
        description={`Đơn ${order.code} sẽ chuyển sang "Chờ lấy hàng".`}
        label="Mã vận đơn"
        placeholder="Mã do đơn vị vận chuyển cấp"
        requiredMessage="Nhập mã vận đơn"
        submitLabel="Bàn giao"
        isSubmitting={handOver.isPending}
        onSubmit={(code) =>
          handOver.mutate(code, done("Đã bàn giao, chờ lấy hàng"))
        }
      />
      <TextInputDialog
        open={dialog === "cancel"}
        onOpenChange={closeDialog}
        title={`Huỷ đơn ${order.code}`}
        description="Hàng sẽ được trả về kho, điểm Mi đã dùng được hoàn lại cho khách."
        label="Lý do huỷ"
        placeholder="Khách đổi ý, hết hàng..."
        requiredMessage="Ghi lý do huỷ đơn"
        submitLabel="Huỷ đơn"
        isSubmitting={cancel.isPending}
        onSubmit={(reason) =>
          cancel.mutate(reason, done("Đã huỷ đơn, hàng đã về kho"))
        }
      />
    </>
  )
}
