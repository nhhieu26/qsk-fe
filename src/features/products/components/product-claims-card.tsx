import { SectionCard } from "@/components/common/section-card"
import { cn } from "@/lib/utils"
import { ANCHOR_SENTENCE } from "@/features/products/constants"
import {
  forbiddenClaims,
  requiresAnchor,
} from "@/features/products/lib/product-compliance"
import type { Product } from "@/features/products/types"

type ProductClaimsCardProps = {
  product: Product
  actions?: React.ReactNode
}

export function ProductClaimsCard({
  product,
  actions,
}: ProductClaimsCardProps) {
  const claims =
    product.claims.length > 0 ? product.claims : ["Chưa nhập câu công dụng nào"]

  return (
    <SectionCard title="Công dụng được phép nói tại quầy">
      <div className="grid gap-5 md:grid-cols-2">
        <ClaimList heading="Nói đúng câu này" headingClassName="text-brand">
          {claims.map((c) => (
            <ClaimItem key={c}>{c}</ClaimItem>
          ))}
          {requiresAnchor(product) && (
            <ClaimItem className="text-warning">
              Kèm câu neo bắt buộc: {ANCHOR_SENTENCE}
            </ClaimItem>
          )}
        </ClaimList>
        <ClaimList
          heading="Tuyệt đối không nói"
          headingClassName="text-pink-700"
        >
          {forbiddenClaims(product).map((c) => (
            <ClaimItem key={c}>{c}</ClaimItem>
          ))}
        </ClaimList>
      </div>
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </SectionCard>
  )
}

function ClaimList({
  heading,
  headingClassName,
  children,
}: {
  heading: string
  headingClassName: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div
        className={cn(
          "mb-2 text-[10.5px] font-bold tracking-[.07em] uppercase",
          headingClassName
        )}
      >
        {heading}
      </div>
      <ul>{children}</ul>
    </div>
  )
}

function ClaimItem({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <li
      className={cn(
        "border-b py-[11px] text-[13.5px] text-foreground last:border-b-0",
        className
      )}
    >
      {children}
    </li>
  )
}
