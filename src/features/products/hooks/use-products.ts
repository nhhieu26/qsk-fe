import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { productsApi } from "@/features/products/api/products-api"
import type {
  AddDocumentInput,
  CreateProductInput,
  DocumentType,
  ProductInput,
} from "@/features/products/types"

export const productKeys = {
  all: ["products"] as const,
  list: () => [...productKeys.all, "list"] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
}

export function useProducts() {
  return useQuery({ queryKey: productKeys.list(), queryFn: productsApi.list })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.get(id),
  })
}

function useInvalidateProducts() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all })
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.create(input),
    onSuccess: invalidate,
  })
}

export function useUpdateProduct(id: string) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (input: ProductInput) => productsApi.update(id, input),
    onSuccess: invalidate,
  })
}

export function useUpdateClaims(id: string) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (claims: readonly string[]) =>
      productsApi.updateClaims(id, claims),
    onSuccess: invalidate,
  })
}

export function useAddDocument(id: string) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (input: AddDocumentInput) => productsApi.addDocument(id, input),
    onSuccess: invalidate,
  })
}

export function useRemoveDocument(id: string) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (type: DocumentType) => productsApi.removeDocument(id, type),
    onSuccess: invalidate,
  })
}
