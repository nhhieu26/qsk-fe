import { useState } from "react"
import { Plus } from "lucide-react"

import { SearchInput } from "@/components/common/search-input"
import { filterProducts } from "@/features/products/lib/product-filters"
import type { Product } from "@/features/products/types"
import { ProductThumb } from "@/features/sales/components/product-thumb"
import type { CartLine } from "@/features/sales/types"
import { formatVnd } from "@/lib/format"

const MAX_RESULTS = 8

type ProductPickerProps = {
  products: readonly Product[]
  lines: readonly CartLine[]
  onAdd: (product: Product) => void
}

/** Ô tìm + thêm sản phẩm ngay trong trang đặt hàng. */
export function ProductPicker({ products, lines, onAdd }: ProductPickerProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const results = filterProducts(products, {
    query,
    category: "all",
    compliance: "all",
  }).slice(0, MAX_RESULTS)

  return (
    <div
      className="relative"
      onFocus={() => setIsOpen(true)}
      onBlur={(e) => {
        // Giữ danh sách mở khi bấm vào một kết quả bên trong.
        if (!e.currentTarget.contains(e.relatedTarget)) setIsOpen(false)
      }}
    >
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Thêm sản phẩm vào đơn..."
        className="h-10"
      />
      {isOpen && (
        <ul className="absolute inset-x-0 top-full z-10 mt-1 max-h-80 overflow-y-auto rounded-xl border bg-popover p-1 shadow-lg">
          {results.length === 0 ? (
            <li className="px-3 py-2.5 text-[13px] text-muted-foreground">
              Không tìm thấy sản phẩm
            </li>
          ) : (
            results.map((p) => {
              const inOrder =
                lines.find((l) => l.productId === p.id)?.quantity ?? 0
              const isFull = inOrder >= p.stock
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={isFull}
                    onClick={() => onAdd(p)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ProductThumb name={p.name} category={p.category} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold">
                        {p.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatVnd(p.price)} ·{" "}
                        {p.stock <= 0
                          ? "Hết hàng"
                          : inOrder > 0
                            ? `Đã có ${inOrder}/${p.stock}`
                            : `Tồn ${p.stock}`}
                      </span>
                    </span>
                    {!isFull && (
                      <Plus
                        aria-hidden="true"
                        className="size-4 shrink-0 text-primary"
                      />
                    )}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
