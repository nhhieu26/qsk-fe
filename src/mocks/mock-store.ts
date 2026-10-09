import { ApiError } from "@/api/http"
import type { Customer } from "@/features/customers/types"
import type { Product } from "@/features/products/types"
import type { Order } from "@/features/sales/types"
import type { MovementType, StockMovement } from "@/features/stock/types"
import { SEED_CUSTOMERS, SEED_MOVEMENTS, SEED_PRODUCTS } from "@/mocks/seed"

const LATENCY_MS = 250
export const MOCK_ACTOR = "Chủ quầy"

/**
 * Kho dữ liệu in-memory cho chế độ mock, mô phỏng backend: mỗi lần ghi thay
 * thế bản ghi mới (không sửa tại chỗ) và luôn trả bản sao cho caller.
 */
function createMockStore() {
  let products: readonly Product[] = SEED_PRODUCTS
  let movements: readonly StockMovement[] = SEED_MOVEMENTS
  let customers: readonly Customer[] = SEED_CUSTOMERS
  let orders: readonly Order[] = []

  const findProduct = (id: string): Product => {
    const product = products.find((p) => p.id === id)
    if (!product) throw new ApiError("Không tìm thấy sản phẩm", 404)
    return product
  }

  const replaceProduct = (
    id: string,
    update: (current: Product) => Product
  ): Product => {
    const next = update(findProduct(id))
    products = products.map((p) => (p.id === id ? next : p))
    return structuredClone(next)
  }

  return {
    listProducts: () => structuredClone([...products]),
    getProduct: (id: string) => structuredClone(findProduct(id)),
    listMovements: () => structuredClone([...movements]),
    listCustomers: () => structuredClone([...customers]),
    listOrders: () => structuredClone([...orders]),
    replaceProduct,

    getOrder(id: string): Order {
      const order = orders.find((o) => o.id === id)
      if (!order) throw new ApiError("Không tìm thấy đơn hàng", 404)
      return structuredClone(order)
    },

    saveOrder(order: Order): Order {
      const exists = orders.some((o) => o.id === order.id)
      orders = exists
        ? orders.map((o) => (o.id === order.id ? order : o))
        : [order, ...orders]
      return structuredClone(order)
    },

    /** Tạo mới hoặc cập nhật khách theo số điện thoại (giống backend upsert). */
    upsertCustomer(
      phone: string,
      update: (current: Customer | undefined) => Customer
    ): Customer {
      const current = customers.find((c) => c.phone === phone)
      const next = update(current)
      customers = current
        ? customers.map((c) => (c.id === current.id ? next : c))
        : [...customers, next]
      return structuredClone(next)
    },

    insertProduct(product: Product): Product {
      products = [...products, product]
      return structuredClone(product)
    },

    /** Đổi tồn kho và ghi một dòng thẻ kho. Không cho tồn âm. */
    moveStock(params: {
      productId: string
      type: MovementType
      delta: (current: number) => number
      reason?: string
      reference?: string
      counterparty?: string
      extra?: (current: Product) => Partial<Product>
    }): Product {
      const current = findProduct(params.productId)
      const before = current.stock
      const after = before + params.delta(before)
      if (after < 0) {
        throw new ApiError(
          `Kho chỉ còn ${before}, không trừ được nhiều hơn thế`,
          400
        )
      }
      const movement: StockMovement = {
        id: crypto.randomUUID(),
        productId: current.id,
        productName: current.name,
        type: params.type,
        quantity: after - before,
        before,
        after,
        actor: MOCK_ACTOR,
        reason: params.reason,
        reference: params.reference,
        counterparty: params.counterparty,
        createdAt: new Date().toISOString(),
      }
      movements = [movement, ...movements]
      return replaceProduct(current.id, (p) => ({
        ...p,
        ...params.extra?.(p),
        stock: after,
      }))
    },
  }
}

export const mockStore = createMockStore()

export function withLatency<T>(run: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(run())
      } catch (error) {
        reject(error)
      }
    }, LATENCY_MS)
  })
}
