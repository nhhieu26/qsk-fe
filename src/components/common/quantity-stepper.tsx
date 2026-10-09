import { Minus, Plus } from "lucide-react"

type QuantityStepperProps = {
  value: number
  max: number
  onChange: (value: number) => void
  /** Cho phép giảm về 0 (xoá dòng). */
  min?: number
  label?: string
}

export function QuantityStepper({
  value,
  max,
  onChange,
  min = 0,
  label = "Số lượng",
}: QuantityStepperProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center overflow-hidden rounded-[9px] border border-input"
    >
      <button
        type="button"
        aria-label="Bớt"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="grid h-8 w-8 place-items-center bg-white text-secondary-foreground hover:bg-muted disabled:opacity-40"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-8 text-center text-[13.5px] font-bold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Thêm"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="grid h-8 w-8 place-items-center bg-white text-secondary-foreground hover:bg-muted disabled:opacity-40"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
