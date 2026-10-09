import type { Customer } from "@/features/customers/types"

export type CustomersRepository = {
  /** Tìm theo tên, số điện thoại hoặc mã hội viên; tối đa vài chục kết quả. */
  search: (query: string) => Promise<Customer[]>
}
