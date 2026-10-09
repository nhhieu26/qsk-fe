import type { Customer } from "@/features/customers/types"
import type { Product } from "@/features/products/types"
import type { PaymentInfo } from "@/features/sales/types"
import type { StockMovement } from "@/features/stock/types"

/** Dữ liệu mẫu cho chế độ mock. Không dùng cho production. */
export const SEED_PRODUCTS: readonly Product[] = [
  {
    id: "sp-canxi",
    name: "Canxi Nano MK7 hộp 60 viên",
    customerGroup: "Cả ba nhóm",
    category: "supplement",
    price: 450_000,
    costPrice: 300_000,
    stock: 4,
    threshold: 10,
    registrationNo: "2780/2021/ĐKSP",
    shelfLife: "36 tháng",
    documents: [
      {
        type: "registration",
        url: "https://example.com/cong-bo-canxi.pdf",
        fileName: "cong-bo-canxi.pdf",
        uploadedBy: "Chủ quầy",
        uploadedAt: "2026-06-02T08:00:00.000Z",
      },
    ],
    claims: ["Hỗ trợ bổ sung canxi cho cơ thể", "Hỗ trợ xương chắc khỏe"],
    loans: [
      {
        id: "mn-1",
        borrower: "Điểm Hà Đông",
        quantity: 2,
        date: "2026-10-01",
        note: "Trưng bày",
      },
    ],
  },
  {
    id: "sp-sua",
    name: "Sữa bột dinh dưỡng trẻ em 800g",
    customerGroup: "Trẻ em",
    category: "infantNutrition",
    price: 620_000,
    costPrice: 480_000,
    stock: 0,
    threshold: 5,
    registrationNo: "1123/2023/ĐKSP",
    shelfLife: "24 tháng",
    documents: [],
    claims: [],
    loans: [],
  },
  {
    id: "sp-may-do",
    name: "Máy đo huyết áp bắp tay",
    customerGroup: "Người lớn",
    category: "medicalDevice",
    price: 890_000,
    stock: 12,
    threshold: 3,
    registrationNo: "220001234/PCBA-HN",
    documents: [
      {
        type: "registration",
        url: "https://example.com/tieu-chuan-may-do.pdf",
        expiresAt: "2026-11-20",
        uploadedBy: "Chủ quầy",
        uploadedAt: "2026-03-10T08:00:00.000Z",
      },
    ],
    claims: ["Đo huyết áp tâm thu, tâm trương và nhịp tim"],
    loans: [],
  },
  {
    id: "sp-tra",
    name: "Trà thảo mộc túi lọc 20 gói",
    category: "food",
    price: 95_000,
    costPrice: 60_000,
    stock: 40,
    threshold: 10,
    documents: [],
    claims: [],
    loans: [],
  },
  {
    id: "sp-tham",
    name: "Thảm tập vận động 6mm",
    category: "equipment",
    price: 250_000,
    costPrice: 150_000,
    stock: 14,
    threshold: 10,
    documents: [],
    claims: [],
    loans: [],
  },
]

export const SEED_MOVEMENTS: readonly StockMovement[] = [
  {
    id: "tk-1",
    productId: "sp-canxi",
    productName: "Canxi Nano MK7 hộp 60 viên",
    type: "loan",
    quantity: -2,
    before: 6,
    after: 4,
    actor: "Chủ quầy",
    reason: "Cho điểm Hà Đông mượn trưng bày",
    counterparty: "Điểm Hà Đông",
    createdAt: "2026-10-01T09:30:00.000Z",
  },
  {
    id: "tk-2",
    productId: "sp-canxi",
    productName: "Canxi Nano MK7 hộp 60 viên",
    type: "import",
    quantity: 6,
    before: 0,
    after: 6,
    actor: "Chủ quầy",
    reason: "Tồn đầu khi tạo sản phẩm",
    createdAt: "2026-09-15T02:00:00.000Z",
  },
  {
    id: "tk-3",
    productId: "sp-tra",
    productName: "Trà thảo mộc túi lọc 20 gói",
    type: "import",
    quantity: 40,
    before: 0,
    after: 40,
    actor: "Chủ quầy",
    reference: "PN-0915",
    createdAt: "2026-09-15T02:10:00.000Z",
  },
]

export const SEED_CUSTOMERS: readonly Customer[] = [
  {
    id: "kh-lan",
    name: "Nguyễn Thị Lan",
    phone: "0912345678",
    email: "lan.nguyen@example.com",
    memberCode: "HV0012",
    points: 45_000,
    addresses: [
      { province: "Hà Nội", ward: "Phường Hà Đông", street: "12 Quang Trung" },
    ],
  },
  {
    id: "kh-minh",
    name: "Trần Văn Minh",
    phone: "0987654321",
    points: 0,
    addresses: [],
    lastInvoice: {
      buyerType: "company",
      buyerName: "Công ty TNHH Minh An",
      taxCode: "0101234567",
      address: "25 Lê Lợi, Phường Hà Đông, Hà Nội",
      email: "ketoan@minhan.example.com",
    },
  },
]

/** Tài khoản nhận tiền mẫu. TODO(backend): lấy từ Cài đặt → Thanh toán. */
export const SEED_PAYMENT_ACCOUNT: Pick<
  PaymentInfo,
  "bankBin" | "bankName" | "accountNumber" | "accountName"
> = {
  bankBin: "970436",
  bankName: "Vietcombank",
  accountNumber: "0011001234567",
  accountName: "QUAY SUC KHOE VAN PHUC",
}
