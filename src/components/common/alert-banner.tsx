import { cn } from "@/lib/utils"

type AlertBannerProps = {
  tone?: "warning" | "danger"
  title: React.ReactNode
  children?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

const TONE: Record<
  NonNullable<AlertBannerProps["tone"]>,
  { box: string; icon: string }
> = {
  warning: {
    box: "border-[#F5DDB5] bg-[#FFF8EC] text-[#6B4A1F]",
    icon: "bg-[#FFE7C2] text-warning",
  },
  danger: {
    box: "border-[#F2C9C5] bg-danger-soft text-[#6B2420]",
    icon: "bg-[#F8D6D2] text-danger",
  },
}

export function AlertBanner({
  tone = "warning",
  title,
  children,
  action,
  className,
}: AlertBannerProps) {
  const t = TONE[tone]
  return (
    <div
      role="alert"
      className={cn(
        "mb-5 flex items-start gap-3 rounded-xl border px-4 py-3.5",
        t.box,
        className
      )}
    >
      <div
        className={cn(
          "grid size-[30px] shrink-0 place-items-center rounded-lg font-extrabold",
          t.icon
        )}
      >
        !
      </div>
      <div className="min-w-0 flex-1 text-[13px] leading-relaxed">
        <b className="mb-0.5 block text-sm">{title}</b>
        {children}
      </div>
      {action}
    </div>
  )
}
