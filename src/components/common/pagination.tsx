import { cn } from "@/lib/utils"

export type PageSlice = {
  page: number
  pageCount: number
  from: number
  to: number
}

/** Tính trang hợp lệ và khoảng phần tử cho phân trang phía client. */
export function paginate(
  total: number,
  page: number,
  perPage: number
): PageSlice {
  const pageCount = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, page), pageCount)
  return {
    page: current,
    pageCount,
    from: (current - 1) * perPage,
    to: Math.min(total, current * perPage),
  }
}

/** Số trang hiện mỗi bên trang đang xem. */
const SIBLINGS = 1

/** Dãy số trang rút gọn: `[1, "gap", 4, 5, 6, "gap", 20]`. */
export function pageItems(page: number, pageCount: number): (number | "gap")[] {
  const keep = new Set([1, pageCount])
  for (let p = page - SIBLINGS; p <= page + SIBLINGS; p += 1) {
    if (p >= 1 && p <= pageCount) keep.add(p)
  }
  const sorted = [...keep].sort((a, b) => a - b)
  return sorted.flatMap((p, i) => {
    const prev = sorted[i - 1]
    if (prev === undefined || p - prev === 1) return [p]
    // Khoảng trống đúng 1 trang thì hiện luôn số đó thay cho dấu "…".
    return p - prev === 2 ? [p - 1, p] : (["gap", p] as const)
  })
}

type PaginationProps = {
  total: number
  slice: PageSlice
  unitLabel: string
  onPageChange: (page: number) => void
}

export function Pagination({
  total,
  slice,
  unitLabel,
  onPageChange,
}: PaginationProps) {
  const { page, pageCount, from, to } = slice
  const items = pageItems(page, pageCount)

  return (
    <div className="flex flex-wrap items-center gap-3 border-t px-[18px] py-3 text-[12.5px] text-muted-foreground">
      Hiển thị {total > 0 ? from + 1 : 0}–{to} trên {total} {unitLabel}
      {pageCount > 1 && (
        <nav aria-label="Phân trang" className="ml-auto flex gap-1">
          <PageButton
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            label="Trang trước"
          >
            ‹
          </PageButton>
          {items.map((p, i) =>
            p === "gap" ? (
              <span
                key={`gap-${i}`}
                aria-hidden="true"
                className="grid w-6 place-items-center"
              >
                …
              </span>
            ) : (
              <PageButton
                key={p}
                isActive={p === page}
                onClick={() => onPageChange(p)}
              >
                {p}
              </PageButton>
            )
          )}
          <PageButton
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            label="Trang sau"
          >
            ›
          </PageButton>
        </nav>
      )}
    </div>
  )
}

function PageButton({
  isActive = false,
  disabled = false,
  label,
  onClick,
  children,
}: {
  isActive?: boolean
  disabled?: boolean
  label?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-[30px] min-w-[30px] rounded-lg border bg-white px-2 text-[12.5px] font-semibold text-secondary-foreground disabled:cursor-default disabled:opacity-40",
        isActive && "border-primary bg-primary text-primary-foreground"
      )}
    >
      {children}
    </button>
  )
}
