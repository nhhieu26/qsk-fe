import type { Product } from "@/features/products/types"
import type {
  AdjustStockInput,
  ImportStockInput,
  ReturnLoanInput,
  StockMovement,
  StocktakeInput,
} from "@/features/stock/types"

export type MovementFilter = { productId?: string }

/** Hợp đồng dữ liệu kho, cài bằng HTTP (thật) hoặc mock. */
export type StockRepository = {
  listMovements: (filter?: MovementFilter) => Promise<StockMovement[]>
  importStock: (input: ImportStockInput) => Promise<Product>
  adjust: (input: AdjustStockInput) => Promise<Product>
  stocktake: (input: StocktakeInput) => Promise<{ adjustedCount: number }>
  returnLoan: (input: ReturnLoanInput) => Promise<Product>
}
