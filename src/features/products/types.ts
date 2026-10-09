import type {
  DOCUMENT_TYPES,
  PRODUCT_CATEGORIES,
} from "@/features/products/constants"

export type ProductCategory = keyof typeof PRODUCT_CATEGORIES
export type DocumentType = (typeof DOCUMENT_TYPES)[number]["key"]

export type ProductDocument = {
  type: DocumentType
  /** Link tới tệp (ổ chung hoặc URL file backend lưu). */
  url: string
  fileName?: string
  /** Ngày hết hiệu lực `YYYY-MM-DD`, nếu giấy có ghi. */
  expiresAt?: string
  note?: string
  uploadedBy: string
  uploadedAt: string
}

/** Một lượt cho mượn hàng chưa trả hết. */
export type ProductLoan = {
  id: string
  borrower: string
  quantity: number
  date: string
  note?: string
}

export type Product = {
  id: string
  name: string
  /** Nhóm khách dùng sản phẩm, ví dụ "Cả ba nhóm". */
  customerGroup?: string
  category?: ProductCategory
  price: number
  costPrice?: number
  stock: number
  /** Ngưỡng tồn an toàn, dưới mức này thì cảnh báo nhập thêm. */
  threshold: number
  registrationNo?: string
  shelfLife?: string
  /** Mục lục hiển thị, ví dụ "Hộp Chuyên Gia Nhí". */
  menuGroup?: string
  /** Giá liên hệ: không bán theo `price` niêm yết (thường `price` = 0). */
  priceOnRequest?: boolean
  /** Cân nặng một đơn vị (gram) để báo phí ship; chưa có thì backend tính 500g. */
  weight?: number
  documents: readonly ProductDocument[]
  /** Câu công dụng được phép nói tại quầy, chép nguyên từ hồ sơ đã duyệt. */
  claims: readonly string[]
  loans: readonly ProductLoan[]
}

export type ProductInput = {
  name: string
  customerGroup?: string
  category?: ProductCategory
  price: number
  costPrice?: number
  threshold: number
  registrationNo?: string
  shelfLife?: string
  /** Không gửi thì backend giữ nguyên; gửi `""` để xoá mục lục. */
  menuGroup?: string
  /** Không gửi thì backend giữ nguyên. */
  priceOnRequest?: boolean
  /** Cân nặng (gram). Không gửi thì backend giữ nguyên. */
  weight?: number
}

export type CreateProductInput = ProductInput & {
  /** Tồn đầu khi tạo, sẽ ghi một dòng nhập kho vào thẻ kho. */
  initialStock: number
}

export type AddDocumentInput = Omit<
  ProductDocument,
  "uploadedBy" | "uploadedAt"
>
