import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: SearchInputProps) {
  return (
    <label
      className={cn(
        "flex h-[38px] items-center gap-2 rounded-[10px] border border-input bg-white px-3 text-muted-foreground focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15",
        className
      )}
    >
      <Search aria-hidden="true" className="size-[15px] shrink-0" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder ?? "Tìm kiếm"}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  )
}
