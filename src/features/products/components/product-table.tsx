import { useNavigate } from "react-router"

import { StatusPill } from "@/components/common/status-pill"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CategoryTag } from "@/features/products/components/category-tag"
import { getMissingDocuments } from "@/features/products/lib/product-compliance"
import type { Product } from "@/features/products/types"
import { formatVnd } from "@/lib/format"

export function ProductTable({ products }: { products: readonly Product[] }) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-surface-2 hover:bg-surface-2">
          <TableHead className="pl-4">Sản phẩm</TableHead>
          <TableHead>Nhóm khách</TableHead>
          <TableHead className="text-right">Giá bán</TableHead>
          <TableHead className="text-right">Tồn</TableHead>
          <TableHead className="pr-4">Hồ sơ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <TableRow
            key={p.id}
            tabIndex={0}
            className="cursor-pointer"
            onClick={() => navigate(`/products/${p.id}`)}
            onKeyDown={(e) =>
              e.key === "Enter" && navigate(`/products/${p.id}`)
            }
          >
            <TableCell className="py-3 pl-4 whitespace-normal">
              <b className="font-semibold text-foreground">{p.name}</b>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <CategoryTag category={p.category} />
                {p.registrationNo && (
                  <span className="text-[11.5px] text-muted-foreground">
                    {p.registrationNo}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-secondary-foreground">
              {p.customerGroup}
            </TableCell>
            <TableCell className="text-right">{formatVnd(p.price)}</TableCell>
            <TableCell className="text-right">{p.stock}</TableCell>
            <TableCell className="pr-4">
              <ComplianceCell product={p} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ComplianceCell({ product }: { product: Product }) {
  if (!product.category) {
    return (
      <StatusPill tone="neutral" withDot={false}>
        Chưa phân loại
      </StatusPill>
    )
  }
  const missing = getMissingDocuments(product)
  if (missing.length > 0) {
    return (
      <StatusPill tone="danger" withDot={false}>
        {missing[0]}
      </StatusPill>
    )
  }
  return (
    <StatusPill tone="success" withDot={false}>
      Đủ · {product.documents.length} tệp
    </StatusPill>
  )
}
