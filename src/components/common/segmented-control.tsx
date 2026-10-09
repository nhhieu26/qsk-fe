import { cn } from "@/lib/utils"

type SegmentedControlProps<T extends string> = {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex rounded-[9px] bg-muted p-[3px]", className)}
    >
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-[30px] rounded-[7px] px-3 text-[12.5px] font-semibold whitespace-nowrap text-muted-foreground",
              isActive && "bg-white text-primary shadow-xs"
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
