import { cn } from "@/lib/utils"

export type ChipOption<T extends string> = {
  value: T
  label: string
  count?: number
  /** Màu riêng khi chọn: [màu chữ, màu nền]. */
  color?: readonly [string, string]
}

type FilterChipsProps<T extends string> = {
  options: readonly ChipOption<T>[]
  value: T
  onChange: (value: T) => void
  /** `pill`: bo tròn, nền nhạt khi chọn; `solid`: nền primary khi chọn. */
  variant?: "pill" | "solid"
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  variant = "pill",
}: FilterChipsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((opt) => {
        const isActive = opt.value === value
        const style =
          opt.color && isActive
            ? {
                color: opt.color[0],
                background: opt.color[1],
                borderColor: opt.color[0],
              }
            : undefined
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            style={style}
            className={cn(
              "inline-flex h-[34px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium whitespace-nowrap text-secondary-foreground transition-colors hover:border-input hover:text-foreground",
              variant === "solid" &&
                "border-transparent font-semibold text-muted-foreground hover:bg-muted",
              isActive &&
                !opt.color &&
                variant === "pill" &&
                "border-[#BFD9F3] bg-primary-soft font-semibold text-primary",
              isActive &&
                variant === "solid" &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              isActive && opt.color && "font-semibold"
            )}
          >
            {opt.color && (
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ background: opt.color[0] }}
              />
            )}
            {opt.label}
            {opt.count !== undefined && (
              <i
                className={cn(
                  "rounded-full bg-muted px-1.5 py-px text-[11.5px] font-semibold text-muted-foreground not-italic tabular-nums",
                  isActive && variant === "solid" && "bg-white/20 text-white",
                  isActive && variant === "pill" && "bg-white"
                )}
              >
                {opt.count}
              </i>
            )}
          </button>
        )
      })}
    </div>
  )
}
