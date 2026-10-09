import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type OptionCard<T extends string> = {
  value: T
  label: string
  description?: string
  icon?: LucideIcon
  /** Phần phụ bên phải, ví dụ phí vận chuyển. */
  aside?: React.ReactNode
  disabled?: boolean
  disabledReason?: string
}

type OptionCardsProps<T extends string> = {
  name: string
  label: string
  options: readonly OptionCard<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/** Nhóm radio dạng thẻ lớn, dễ bấm trên máy tính bảng tại quầy. */
export function OptionCards<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  className,
}: OptionCardsProps<T>) {
  return (
    <fieldset
      className={cn(
        "grid gap-2.5 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]",
        className
      )}
    >
      <legend className="sr-only">{label}</legend>
      {options.map((opt) => {
        const isActive = opt.value === value
        const Icon = opt.icon
        return (
          <label
            key={opt.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] border-input bg-white px-3.5 py-3 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-primary/25",
              isActive && "border-primary bg-primary-soft",
              opt.disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={isActive}
              disabled={opt.disabled}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {Icon && (
              <Icon
                aria-hidden="true"
                className={cn(
                  "mt-0.5 size-5 shrink-0 text-muted-foreground",
                  isActive && "text-primary"
                )}
              />
            )}
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-sm font-semibold",
                  isActive && "text-primary"
                )}
              >
                {opt.label}
              </span>
              {(opt.disabled ? opt.disabledReason : opt.description) && (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {opt.disabled ? opt.disabledReason : opt.description}
                </span>
              )}
            </span>
            {opt.aside && (
              <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                {opt.aside}
              </span>
            )}
          </label>
        )
      })}
    </fieldset>
  )
}
