import { useState } from "react"
import { Check, Pencil, X } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { useUpdateOrderNote } from "@/features/sales/hooks/use-orders"
import type { Order } from "@/features/sales/types"
import { notifyError, notifySuccess } from "@/lib/notify"

const NOTE_MAX = 500

type OrderNoteCellProps = {
  order: Pick<Order, "id" | "code" | "note">
  canEdit: boolean
}

/** Ghi chú nội bộ của đơn, bấm bút chì để sửa ngay trong bảng. */
export function OrderNoteCell({ order, canEdit }: OrderNoteCellProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return <NoteEditor order={order} onClose={() => setIsEditing(false)} />
  }

  return (
    <div className="flex min-w-[180px] items-start gap-1.5">
      <p className="line-clamp-2 flex-1 text-[12.5px] whitespace-pre-line text-secondary-foreground">
        {order.note ?? <span className="text-muted-foreground/70">—</span>}
      </p>
      {canEdit && (
        <button
          type="button"
          aria-label={`Sửa ghi chú đơn ${order.code}`}
          onClick={() => setIsEditing(true)}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-primary"
        >
          <Pencil className="size-3.5" />
        </button>
      )}
    </div>
  )
}

function NoteEditor({
  order,
  onClose,
}: {
  order: OrderNoteCellProps["order"]
  onClose: () => void
}) {
  const [text, setText] = useState(order.note ?? "")
  const update = useUpdateOrderNote()

  const save = () => {
    if (text.trim() === (order.note ?? "")) {
      onClose()
      return
    }
    update.mutate(
      { id: order.id, note: text },
      {
        onSuccess: () => {
          notifySuccess(`Đã lưu ghi chú đơn ${order.code}`)
          onClose()
        },
        onError: (error) => notifyError(error),
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose()
    // Enter lưu, Shift+Enter xuống dòng.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      save()
    }
  }

  return (
    <div className="grid min-w-[220px] gap-1.5">
      <Textarea
        autoFocus
        aria-label={`Ghi chú đơn ${order.code}`}
        value={text}
        maxLength={NOTE_MAX}
        disabled={update.isPending}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-16 text-[13px]"
      />
      <div className="flex items-center justify-end gap-1">
        <span className="mr-auto text-[11px] text-muted-foreground">
          Enter lưu · Esc huỷ
        </span>
        <button
          type="button"
          aria-label="Huỷ sửa"
          onClick={onClose}
          className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Lưu ghi chú"
          disabled={update.isPending}
          onClick={save}
          className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Check className="size-4" />
        </button>
      </div>
    </div>
  )
}
