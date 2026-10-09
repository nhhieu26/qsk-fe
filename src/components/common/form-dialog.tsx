import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** `id` của thẻ `<form>` bên trong để nút submit ở footer gắn vào. */
  formId: string
  submitLabel: string
  isSubmitting?: boolean
  children: React.ReactNode
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  formId,
  submitLabel,
  isSubmitting = false,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-6 sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-bold">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter className="-mx-6 -mb-6 px-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => onOpenChange(false)}
          >
            Thôi
          </Button>
          <Button type="submit" form={formId} size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu…" : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
