import type {
  CreateOrderInput,
  Order,
  OrderListQuery,
  OrderPage,
  PaymentInfo,
} from "@/features/sales/types"

/** Hợp đồng dữ liệu đơn hàng, cài bằng HTTP (thật) hoặc mock. */
export type OrdersRepository = {
  /** Lọc + phân trang ở server; kèm số đơn mỗi trạng thái cho các tab. */
  list: (query: OrderListQuery) => Promise<OrderPage>
  get: (id: string) => Promise<Order>
  /** Tạo đơn: backend tính lại giá + phí, trừ kho, trừ/tích điểm. */
  create: (input: CreateOrderInput) => Promise<Order>
  getPaymentInfo: (id: string) => Promise<PaymentInfo>
  markPaid: (id: string) => Promise<Order>
  approve: (id: string) => Promise<Order>
  handOver: (id: string, input: { trackingCode: string }) => Promise<Order>
  markShipping: (id: string) => Promise<Order>
  markReady: (id: string) => Promise<Order>
  complete: (id: string) => Promise<Order>
  /** Huỷ đơn: hoàn kho + hoàn điểm. */
  cancel: (id: string, input: { reason: string }) => Promise<Order>
  /** Ghi chú nội bộ, sửa được ở mọi trạng thái; chuỗi rỗng là xoá. */
  updateNote: (id: string, note: string) => Promise<Order>
}
