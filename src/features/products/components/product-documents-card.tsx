import { InfoRow, SectionCard } from "@/components/common/section-card"
import { StatusPill, type StatusTone } from "@/components/common/status-pill"
import { Button } from "@/components/ui/button"
import {
  DOCUMENT_EXPIRY_WARNING_DAYS,
  DOCUMENT_TYPES,
} from "@/features/products/constants"
import { useRemoveDocument } from "@/features/products/hooks/use-products"
import {
  documentLabel,
  isDocumentRequired,
} from "@/features/products/lib/product-compliance"
import type {
  DocumentType,
  Product,
  ProductDocument,
} from "@/features/products/types"
import { daysUntil, formatDate } from "@/lib/format"
import { notifyError, notifySuccess } from "@/lib/notify"

type ProductDocumentsCardProps = {
  product: Product
  canManage: boolean
}

function documentStatus(doc: ProductDocument): {
  label: string
  tone: StatusTone
} {
  if (!doc.expiresAt) return { label: "Đã có", tone: "success" }
  const daysLeft = daysUntil(doc.expiresAt)
  if (daysLeft < 0)
    return { label: `Hết hạn ${formatDate(doc.expiresAt)}`, tone: "danger" }
  return {
    label: `Đến ${formatDate(doc.expiresAt)}`,
    tone: daysLeft <= DOCUMENT_EXPIRY_WARNING_DAYS ? "warning" : "success",
  }
}

export function ProductDocumentsCard({
  product,
  canManage,
}: ProductDocumentsCardProps) {
  const remove = useRemoveDocument(product.id)

  const handleRemove = (type: DocumentType) => {
    // TODO: thay bằng AlertDialog khi có component xác nhận chung.
    if (
      !window.confirm(
        `Gỡ ${documentLabel(type, product)} khỏi hồ sơ sản phẩm này?`
      )
    )
      return
    remove.mutate(type, {
      onSuccess: () => notifySuccess("Đã gỡ tài liệu"),
      onError: (error) => notifyError(error),
    })
  }

  return (
    <SectionCard title="Hồ sơ giấy tờ" className="mb-0">
      {DOCUMENT_TYPES.map(({ key }) => {
        const doc = product.documents.find((d) => d.type === key)
        const isRequired = isDocumentRequired(key, product)
        return (
          <InfoRow
            key={key}
            label={
              <>
                <span className="font-medium">
                  {documentLabel(key, product)}
                </span>
                {isRequired && (
                  <span className="ml-1.5 text-[12.5px] text-muted-foreground">
                    bắt buộc
                  </span>
                )}
              </>
            }
          >
            {doc ? (
              <>
                <StatusPill tone={documentStatus(doc).tone} withDot={false}>
                  {documentStatus(doc).label}
                </StatusPill>
                <Button asChild variant="outline" size="sm">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    Mở tệp
                  </a>
                </Button>
                {canManage && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={remove.isPending}
                    onClick={() => handleRemove(key)}
                  >
                    Gỡ
                  </Button>
                )}
              </>
            ) : (
              <StatusPill
                tone={isRequired ? "danger" : "neutral"}
                withDot={false}
              >
                {isRequired ? "Thiếu" : "Chưa có"}
              </StatusPill>
            )}
          </InfoRow>
        )
      })}
    </SectionCard>
  )
}
