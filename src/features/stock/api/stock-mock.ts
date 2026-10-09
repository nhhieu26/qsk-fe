import { ApiError } from "@/api/http"
import { MOVEMENT_TYPES } from "@/features/stock/constants"
import type { StockRepository } from "@/features/stock/api/stock-repository"
import { toIsoDate } from "@/lib/format"
import { mockStore, withLatency } from "@/mocks/mock-store"

export const stockMock: StockRepository = {
  listMovements: (filter) =>
    withLatency(() =>
      mockStore
        .listMovements()
        .filter((m) => !filter?.productId || m.productId === filter.productId)
    ),

  importStock: ({ productId, quantity, reference, note }) =>
    withLatency(() =>
      mockStore.moveStock({
        productId,
        type: "import",
        delta: () => quantity,
        reason: note,
        reference,
      })
    ),

  adjust: (input) =>
    withLatency(() => {
      if (input.type === "stocktake") {
        return mockStore.moveStock({
          productId: input.productId,
          type: "stocktake",
          delta: (current) => input.countedQuantity - current,
          reason: input.reason,
        })
      }
      const delta = MOVEMENT_TYPES[input.type].direction * input.quantity
      return mockStore.moveStock({
        productId: input.productId,
        type: input.type,
        delta: () => delta,
        reason: input.reason,
        counterparty: input.counterparty,
        extra:
          input.type === "loan"
            ? (p) => ({
                loans: [
                  ...p.loans,
                  {
                    id: crypto.randomUUID(),
                    borrower: input.counterparty ?? "",
                    quantity: input.quantity,
                    date: toIsoDate(new Date()),
                    note: input.reason,
                  },
                ],
              })
            : undefined,
      })
    }),

  stocktake: ({ counts }) =>
    withLatency(() => {
      const changed = counts.filter(
        (c) => mockStore.getProduct(c.productId).stock !== c.countedQuantity
      )
      changed.forEach((c) =>
        mockStore.moveStock({
          productId: c.productId,
          type: "stocktake",
          delta: (current) => c.countedQuantity - current,
          reason: "Kiểm kê cả kho",
        })
      )
      return { adjustedCount: changed.length }
    }),

  returnLoan: ({ productId, loanId, quantity, note }) =>
    withLatency(() => {
      const loan = mockStore
        .getProduct(productId)
        .loans.find((l) => l.id === loanId)
      if (!loan) throw new ApiError("Không tìm thấy lượt mượn", 404)
      if (quantity < 1 || quantity > loan.quantity) {
        throw new ApiError(`Số lượng trả phải từ 1 đến ${loan.quantity}`, 400)
      }
      return mockStore.moveStock({
        productId,
        type: "return",
        delta: () => quantity,
        reason: note,
        counterparty: loan.borrower,
        extra: (p) => ({
          loans: p.loans
            .map((l) =>
              l.id === loanId ? { ...l, quantity: l.quantity - quantity } : l
            )
            .filter((l) => l.quantity > 0),
        }),
      })
    }),
}
