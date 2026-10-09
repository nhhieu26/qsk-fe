import { toast } from "sonner"

export function notifySuccess(message: string): void {
  toast.success(message)
}

/** Hiện lỗi thân thiện; `ApiError` từ `http` đã có message tiếng Việt. */
export function notifyError(
  error: unknown,
  fallback = "Có lỗi xảy ra, thử lại sau"
): void {
  toast.error(
    error instanceof Error && error.message ? error.message : fallback
  )
}

export function notifyWarning(message: string): void {
  toast.warning(message)
}
