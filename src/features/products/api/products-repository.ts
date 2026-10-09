import type {
  AddDocumentInput,
  CreateProductInput,
  DocumentType,
  Product,
  ProductInput,
} from "@/features/products/types"

/** Hợp đồng dữ liệu sản phẩm, cài bằng HTTP (thật) hoặc mock. */
export type ProductsRepository = {
  list: () => Promise<Product[]>
  get: (id: string) => Promise<Product>
  create: (input: CreateProductInput) => Promise<Product>
  update: (id: string, input: ProductInput) => Promise<Product>
  updateClaims: (id: string, claims: readonly string[]) => Promise<Product>
  addDocument: (id: string, input: AddDocumentInput) => Promise<Product>
  removeDocument: (id: string, type: DocumentType) => Promise<Product>
}
