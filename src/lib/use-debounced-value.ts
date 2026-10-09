import { useEffect, useState } from "react"

/** Giá trị chỉ cập nhật sau khi ngừng thay đổi `delayMs` (vd ô gõ địa chỉ). */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}
