import { useId, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/common/form-field"
import { Input } from "@/components/ui/input"

type TextInputDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  label: string
  placeholder?: string
  submitLabel: string
  isSubmitting: boolean
  requiredMessage: string
  onSubmit: (value: string) => void
}

/** Dialog một ô nhập: lý do huỷ, mã vận đơn... */
export function TextInputDialog({
  open,
  onOpenChange,
  submitLabel,
  isSubmitting,
  title,
  description,
  ...field
}: TextInputDialogProps) {
  const formId = useId()
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      formId={formId}
      submitLabel={submitLabel}
      isSubmitting={isSubmitting}
    >
      <TextInputForm formId={formId} {...field} />
    </FormDialog>
  )
}

function TextInputForm({
  formId,
  label,
  placeholder,
  requiredMessage,
  onSubmit,
}: Pick<
  TextInputDialogProps,
  "label" | "placeholder" | "requiredMessage" | "onSubmit"
> & { formId: string }) {
  const [value, setValue] = useState("")
  const [error, setError] = useState<string>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() === "") {
      setError(requiredMessage)
      return
    }
    onSubmit(value.trim())
  }

  return (
    <form id={formId} noValidate onSubmit={handleSubmit}>
      <FormField label={label} htmlFor={`${formId}-input`} error={error}>
        <Input
          id={`${formId}-input`}
          autoFocus
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </FormField>
    </form>
  )
}
