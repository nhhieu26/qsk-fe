import { InfoRow, SectionCard } from "@/components/common/section-card"
import { categoryLabel } from "@/features/products/lib/product-compliance"
import type { Product } from "@/features/products/types"
import { formatVnd } from "@/lib/format"

export function ProductInfoCard({ product }: { product: Product }) {
  const rows: readonly [string, string][] = [
    ["Loại hàng", categoryLabel(product.category)],
    ["Nhóm khách", product.customerGroup ?? ""],
    ["Giá bán", formatVnd(product.price)],
    [
      "Giá nhập cho điểm",
      product.costPrice ? formatVnd(product.costPrice) : "chưa ghi",
    ],
    ["Số công bố", product.registrationNo ?? "chưa ghi"],
    ["Hạn dùng", product.shelfLife ?? "chưa ghi"],
    ["Tồn kho", `${product.stock} · ngưỡng ${product.threshold}`],
  ]

  return (
    <SectionCard title="Thông tin" className="mb-0">
      {rows.map(([label, value]) => (
        <InfoRow
          key={label}
          label={<span className="font-normal">{label}</span>}
        >
          <span className="font-bold text-foreground">{value}</span>
        </InfoRow>
      ))}
    </SectionCard>
  )
}
