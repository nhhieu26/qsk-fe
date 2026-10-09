import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function PageLoading() {
  return (
    <div aria-busy="true" aria-label="Đang tải" className="grid gap-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  )
}

type PageErrorProps = {
  error: unknown
  onRetry?: () => void
}

export function PageError({ error, onRetry }: PageErrorProps) {
  const message =
    error instanceof Error ? error.message : "Không tải được dữ liệu"
  return (
    <div
      role="alert"
      className="grid place-items-center gap-3 rounded-[14px] border bg-card px-5 py-12 text-center"
    >
      <b className="text-[15px] font-semibold">Không tải được dữ liệu</b>
      <p className="text-[13.5px] text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="lg" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  )
}
