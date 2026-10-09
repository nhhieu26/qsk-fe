import type { ProductsRepository } from "@/features/products/api/products-repository"
import type { Product } from "@/features/products/types"
import { MOCK_ACTOR, mockStore, withLatency } from "@/mocks/mock-store"

export const productsMock: ProductsRepository = {
  list: () => withLatency(() => mockStore.listProducts()),

  get: (id) => withLatency(() => mockStore.getProduct(id)),

  create: ({ initialStock, ...input }) =>
    withLatency(() => {
      const product: Product = {
        ...input,
        id: crypto.randomUUID(),
        stock: 0,
        documents: [],
        claims: [],
        loans: [],
      }
      mockStore.insertProduct(product)
      if (initialStock <= 0) return mockStore.getProduct(product.id)
      return mockStore.moveStock({
        productId: product.id,
        type: "import",
        delta: () => initialStock,
        reason: "Tồn đầu khi tạo sản phẩm",
      })
    }),

  update: (id, input) =>
    withLatency(() =>
      mockStore.replaceProduct(id, (p) => ({ ...p, ...input }))
    ),

  updateClaims: (id, claims) =>
    withLatency(() =>
      mockStore.replaceProduct(id, (p) => ({ ...p, claims: [...claims] }))
    ),

  addDocument: (id, input) =>
    withLatency(() =>
      mockStore.replaceProduct(id, (p) => ({
        ...p,
        documents: [
          ...p.documents.filter((d) => d.type !== input.type),
          {
            ...input,
            uploadedBy: MOCK_ACTOR,
            uploadedAt: new Date().toISOString(),
          },
        ],
      }))
    ),

  removeDocument: (id, type) =>
    withLatency(() =>
      mockStore.replaceProduct(id, (p) => ({
        ...p,
        documents: p.documents.filter((d) => d.type !== type),
      }))
    ),
}
