import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"

type UserAvatarProps = {
  name: string
  className?: string
}

export function UserAvatar({ name, className }: UserAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-sky-500 text-[13px] font-bold text-white",
        className
      )}
    >
      {initials(name)}
    </span>
  )
}
