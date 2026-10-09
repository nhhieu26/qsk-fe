import { useState } from "react"

import { SearchInput } from "@/components/common/search-input"
import { useCustomerSearch } from "@/features/customers/hooks/use-customers"
import type { Customer } from "@/features/customers/types"
import { formatNumber } from "@/lib/format"

/** Gõ ít nhất từng này ký tự mới tìm, tránh gọi API theo từng phím đầu. */
const MIN_QUERY_LENGTH = 2

type CustomerSearchProps = {
  onSelect: (customer: Customer) => void
}

export function CustomerSearch({ onSelect }: CustomerSearchProps) {
  const [query, setQuery] = useState("")
  const trimmed = query.trim()
  const isSearching = trimmed.length >= MIN_QUERY_LENGTH
  const { data: results = [], isFetching } = useCustomerSearch(
    trimmed,
    isSearching
  )

  return (
    <div className="relative">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Tìm khách cũ theo số điện thoại, tên hoặc mã hội viên"
        className="h-[42px]"
      />
      {isSearching && (
        <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-72 overflow-y-auto rounded-xl border bg-popover p-1 shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-2.5 text-[13px] text-muted-foreground">
              {isFetching
                ? "Đang tìm…"
                : "Không thấy khách, nhập thông tin mới bên dưới."}
            </p>
          ) : (
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect(c)
                  setQuery("")
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
              >
                <span className="min-w-0 flex-1">
                  <b className="block text-[13.5px] font-semibold">{c.name}</b>
                  <span className="text-xs text-muted-foreground">
                    {c.phone}
                    {c.memberCode && ` · ${c.memberCode}`}
                  </span>
                </span>
                {c.points > 0 && (
                  <span className="rounded-md bg-warning-soft px-2 py-0.5 text-xs font-bold text-warning">
                    {formatNumber(c.points)} Mi
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
