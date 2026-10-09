export const DOCUMENT_TYPES = [
  { key: "registration", label: "Hồ sơ công bố sản phẩm" },
  { key: "advertising", label: "Giấy xác nhận nội dung quảng cáo" },
  { key: "testing", label: "Phiếu kiểm nghiệm" },
  { key: "factory", label: "Giấy chứng nhận cơ sở sản xuất" },
  { key: "label", label: "Nhãn sản phẩm" },
  { key: "consulting", label: "Tài liệu tư vấn" },
] as const

type CategoryDef = {
  label: string
  /** Tên riêng của giấy công bố theo loại hàng. */
  registrationLabel: string
  requiredDocuments: readonly (typeof DOCUMENT_TYPES)[number]["key"][]
  /** Bắt buộc kèm câu "không phải là thuốc" khi tư vấn. */
  requiresAnchor: boolean
  /** [màu chữ, màu nền] cho tag. */
  color: readonly [string, string]
}

/**
 * Loại hàng và giấy tờ bắt buộc theo Nghị định 15/2018/NĐ-CP (thực phẩm)
 * và Nghị định 98/2021/NĐ-CP (trang thiết bị y tế). Thứ tự key = thứ tự hiển thị.
 */
export const PRODUCT_CATEGORIES = {
  supplement: {
    label: "Thực phẩm bảo vệ sức khỏe",
    registrationLabel: "Giấy tiếp nhận đăng ký bản công bố sản phẩm",
    requiredDocuments: ["registration", "advertising"],
    requiresAnchor: true,
    color: ["#1A7FD6", "#E8F3FD"],
  },
  infantNutrition: {
    label: "Sản phẩm dinh dưỡng dùng cho trẻ đến 36 tháng tuổi",
    registrationLabel: "Giấy tiếp nhận đăng ký bản công bố sản phẩm",
    requiredDocuments: ["registration", "advertising"],
    requiresAnchor: false,
    color: ["#C76A0A", "#FFF1E0"],
  },
  fortifiedFood: {
    label: "Thực phẩm bổ sung",
    registrationLabel: "Bản tự công bố sản phẩm",
    requiredDocuments: ["registration"],
    requiresAnchor: false,
    color: ["#2C8A35", "#E8F6EA"],
  },
  food: {
    label: "Thực phẩm thông thường",
    registrationLabel: "Bản tự công bố sản phẩm",
    requiredDocuments: ["registration"],
    requiresAnchor: false,
    color: ["#9A7300", "#FFF6D2"],
  },
  medicalDevice: {
    label: "Trang thiết bị y tế",
    registrationLabel: "Bản công bố tiêu chuẩn áp dụng",
    requiredDocuments: ["registration"],
    requiresAnchor: false,
    color: ["#5E4BA0", "#F0EDFA"],
  },
  equipment: {
    label: "Dụng cụ, đồ dùng",
    registrationLabel: "Hồ sơ công bố sản phẩm",
    requiredDocuments: [],
    requiresAnchor: false,
    color: ["#B81E66", "#FCEAF2"],
  },
} as const satisfies Record<string, CategoryDef>

export const UNCATEGORIZED_COLOR = ["#6A7690", "#F1F4F8"] as const

export const ANCHOR_SENTENCE =
  "Thực phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh."

export const FORBIDDEN_CLAIMS_DEVICE = [
  "Mở rộng sang bệnh khác ngoài mục đích sử dụng đã công bố",
  "Khuyên dùng cho trẻ dưới 3 tuổi",
  "Hứa hiệu quả trong bao nhiêu ngày",
  "Thay cho việc đi khám khi sốt cao, khó thở, triệu chứng kéo dài",
] as const

export const FORBIDDEN_CLAIMS_DEFAULT = [
  "Chữa, điều trị, khỏi, hết hẳn",
  "Thêm bệnh hoặc cơ quan ngoài dòng đã công bố",
  "Suy từ thành phần ra công dụng",
  "Hứa hiệu quả trong bao nhiêu ngày",
] as const

/** Giấy còn ≤ số ngày này thì cảnh báo sắp hết hạn. */
export const DOCUMENT_EXPIRY_WARNING_DAYS = 60
