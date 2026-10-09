type CheckoutSectionProps = {
  step: number
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

/** Một bước trong trang đặt hàng, đánh số cho nhân viên dễ theo. */
export function CheckoutSection({
  step,
  title,
  description,
  actions,
  children,
}: CheckoutSectionProps) {
  return (
    <section className="rounded-2xl border bg-card px-5 py-5 sm:px-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-[13px] font-bold text-white">
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base leading-7 font-bold">{title}</h2>
          {description && (
            <p className="text-[12.5px] text-muted-foreground">{description}</p>
          )}
        </div>
        {actions}
      </div>
      <div className="grid gap-3.5">{children}</div>
    </section>
  )
}
