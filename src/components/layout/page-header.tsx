import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: React.ReactNode
  description?: React.ReactNode
  /** Dòng nhỏ phía trên tiêu đề, ví dụ "Hàng hoá / Kho". */
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-start gap-4", className)}>
      <div className="min-w-0 flex-[1_1_320px]">
        {breadcrumb && (
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            {breadcrumb}
          </div>
        )}
        <h1 className="text-2xl leading-tight font-bold tracking-tight text-balance">
          {title}
        </h1>
        {description && (
          <div className="mt-1 max-w-[75ch] text-[13px] text-muted-foreground">
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
