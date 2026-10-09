import { cn } from "@/lib/utils"

export type StatusTone = "success" | "warning" | "danger" | "violet" | "neutral"

const TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  violet: "bg-violet-soft text-violet",
  neutral: "bg-muted text-muted-foreground",
}

type StatusPillProps = {
  tone: StatusTone
  children: React.ReactNode
  /** Hiện chấm tròn phía trước. */
  withDot?: boolean
  className?: string
}

export function StatusPill({
  tone,
  children,
  withDot = true,
  className,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        withDot && "before:size-1.5 before:rounded-full before:bg-current",
        TONE_CLASS[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
