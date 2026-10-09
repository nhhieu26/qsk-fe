const VND = new Intl.NumberFormat("vi-VN")
const MS_PER_DAY = 86_400_000
const WEEKDAYS = [
  "Chủ nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
] as const

export function formatVnd(value: number): string {
  return `${VND.format(Math.round(value))}đ`
}

export function formatNumber(value: number): string {
  return VND.format(value)
}

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

/** `2026-10-08` hoặc ISO → `08/10/2026`. */
export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return ""
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function formatTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return ""
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** `Thứ Năm, 08/10/2026` */
export function formatLongDate(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${formatDate(d)}`
}

export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Số ngày từ hôm nay tới `isoDate` (âm nếu đã qua). */
export function daysUntil(isoDate: string, today = new Date()): number {
  const target = new Date(`${isoDate}T00:00:00`)
  const start = new Date(`${toIsoDate(today)}T00:00:00`)
  return Math.round((target.getTime() - start.getTime()) / MS_PER_DAY)
}

/** Bỏ dấu tiếng Việt + lowercase để tìm kiếm không phân biệt dấu. */
export function normalizeSearch(value: string | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
}

/** Chữ cái đầu của tên cuối, dùng cho avatar. */
export function initials(name: string | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/)
  return (parts[parts.length - 1]?.charAt(0) ?? "?").toUpperCase() || "?"
}
