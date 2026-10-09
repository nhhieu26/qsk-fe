import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon: LucideIcon
  /** Class màu cho ô icon, ví dụ "bg-warning-soft text-warning". */
  iconClassName: string
  valueClassName?: string
  onClick?: () => void
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClassName,
  valueClassName,
  onClick,
}: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex flex-col gap-0.5 rounded-[14px] border bg-card px-[18px] py-4 text-left shadow-xs transition-colors enabled:cursor-pointer enabled:hover:border-input disabled:cursor-default"
    >
      <div className="flex items-center justify-between gap-2 text-[12.5px] font-medium text-muted-foreground">
        {label}
        <i
          className={cn(
            "grid size-7 place-items-center rounded-lg",
            iconClassName
          )}
        >
          <Icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
        </i>
      </div>
      <b
        className={cn(
          "mt-1.5 text-[clamp(20px,2vw,26px)] leading-snug font-bold tracking-tight [overflow-wrap:anywhere] tabular-nums",
          valueClassName
        )}
      >
        {value}
      </b>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </button>
  )
}
