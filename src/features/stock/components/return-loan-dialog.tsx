import { useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/common/form-field"
import { Input } from "@/components/ui/input"
import type { ProductLoan } from "@/features/products/types"
import type { LoanEntry } from "@/features/stock/components/loans-card"
import { useReturnLoan } from "@/features/stock/hooks/use-stock"
import { notifyError, notifySuccess } from "@/lib/notify"

const FORM_ID = "return-loan-form"

type ReturnLoanDialogProps = {
  /** `undefined` = đóng. */
  entry: LoanEntry | undefined
  onClose: () => void
}

type ReturnValues = { quantity: number; note?: string }

export function ReturnLoanDialog({ entry, onClose }: ReturnLoanDialogProps) {
  const returnLoan = useReturnLoan()
  if (!entry) return null
  const { product, loan } = entry

  const submit = ({ quantity, note }: ReturnValues) =>
    returnLoan.mutate(
      { productId: product.id, loanId: loan.id, quantity, note },
      {
        onSuccess: () => {
          notifySuccess(`Đã nhận lại ${quantity} vào kho`)
          onClose()
        },
        onError: (error) => notifyError(error),
      }
    )

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Nhận trả · ${loan.borrower}`}
      description={product.name}
      formId={FORM_ID}
      submitLabel="Nhận lại vào kho"
      isSubmitting={returnLoan.isPending}
    >
      <ReturnLoanForm key={loan.id} loan={loan} onSubmit={submit} />
    </FormDialog>
  )
}

function ReturnLoanForm({
  loan,
  onSubmit,
}: {
  loan: ProductLoan
  onSubmit: (values: ReturnValues) => void
}) {
  const [quantity, setQuantity] = useState(() => String(loan.quantity))
  const [note, setNote] = useState("")
  const [error, setError] = useState<string>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = Number(quantity)
    if (!Number.isInteger(n) || n < 1 || n > loan.quantity) {
      setError(`Số lượng phải từ 1 đến ${loan.quantity}`)
      return
    }
    onSubmit({ quantity: n, note: note.trim() || undefined })
  }

  return (
    <form
      id={FORM_ID}
      noValidate
      onSubmit={handleSubmit}
      className="grid gap-3.5"
    >
      <FormField
        label={`Số lượng nhận lại, đang mượn ${loan.quantity}`}
        htmlFor="tr-qty"
        error={error}
      >
        <Input
          id="tr-qty"
          type="number"
          min={1}
          max={loan.quantity}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </FormField>
      <FormField label="Ghi chú" htmlFor="tr-note">
        <Input
          id="tr-note"
          placeholder="Tình trạng hàng khi nhận lại"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </FormField>
    </form>
  )
}
