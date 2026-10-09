import { cn } from "@/lib/utils"

type SectionCardProps = {
  title?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** Khối nội dung có viền + tiêu đề, tương đương `.card` trong bản thiết kế. */
export function SectionCard({
  title,
  actions,
  className,
  children,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "mb-5 rounded-[14px] border bg-card px-6 py-[22px] shadow-xs",
        className
      )}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-center gap-2.5">
          {title && <h2 className="flex-1 text-base font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

type InfoRowProps = {
  label: React.ReactNode
  children?: React.ReactNode
  className?: string
}

/** Dòng nhãn — giá trị, có gạch chân, tương đương `.rl`. */
export function InfoRow({ label, children, className }: InfoRowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 border-b py-[11px] text-[13.5px] text-secondary-foreground last:border-b-0",
        className
      )}
    >
      <span className="min-w-0 flex-1 text-foreground">{label}</span>
      {children}
    </div>
  )
}
