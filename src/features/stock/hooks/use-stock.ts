import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { productKeys } from "@/features/products/hooks/use-products"
import { stockApi } from "@/features/stock/api/stock-api"
import type { MovementFilter } from "@/features/stock/api/stock-repository"
import type {
  AdjustStockInput,
  ImportStockInput,
  ReturnLoanInput,
  StocktakeInput,
} from "@/features/stock/types"

export const stockKeys = {
  all: ["stock"] as const,
  movements: (filter: MovementFilter = {}) =>
    [...stockKeys.all, "movements", filter] as const,
}

export function useStockMovements(filter: MovementFilter = {}) {
  return useQuery({
    queryKey: stockKeys.movements(filter),
    queryFn: () => stockApi.listMovements(filter),
  })
}

/** Thay đổi tồn ảnh hưởng cả sản phẩm và thẻ kho nên làm mới cả hai. */
function useInvalidateStock() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: stockKeys.all }),
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
    ])
}

export function useImportStock() {
  const invalidate = useInvalidateStock()
  return useMutation({
    mutationFn: (input: ImportStockInput) => stockApi.importStock(input),
    onSuccess: invalidate,
  })
}

export function useAdjustStock() {
  const invalidate = useInvalidateStock()
  return useMutation({
    mutationFn: (input: AdjustStockInput) => stockApi.adjust(input),
    onSuccess: invalidate,
  })
}

export function useStocktake() {
  const invalidate = useInvalidateStock()
  return useMutation({
    mutationFn: (input: StocktakeInput) => stockApi.stocktake(input),
    onSuccess: invalidate,
  })
}

export function useReturnLoan() {
  const invalidate = useInvalidateStock()
  return useMutation({
    mutationFn: (input: ReturnLoanInput) => stockApi.returnLoan(input),
    onSuccess: invalidate,
  })
}
