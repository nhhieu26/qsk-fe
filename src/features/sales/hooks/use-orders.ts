import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { customerKeys } from "@/features/customers/hooks/use-customers"
import { productKeys } from "@/features/products/hooks/use-products"
import { ordersApi } from "@/features/sales/api/orders-api"
import type {
  CreateOrderInput,
  Order,
  OrderListQuery,
} from "@/features/sales/types"
import { stockKeys } from "@/features/stock/hooks/use-stock"

export const orderKeys = {
  all: ["orders"] as const,
  list: (query: OrderListQuery) => [...orderKeys.all, "list", query] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
  payment: (id: string) => [...orderKeys.all, "payment", id] as const,
}

/** Giữ trang cũ trong lúc tải trang/bộ lọc mới để bảng không nháy trắng. */
export function useOrders(query: OrderListQuery) {
  return useQuery({
    queryKey: orderKeys.list(query),
    queryFn: () => ordersApi.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.get(id),
  })
}

export function usePaymentInfo(id: string, enabled: boolean) {
  return useQuery({
    queryKey: orderKeys.payment(id),
    queryFn: () => ordersApi.getPaymentInfo(id),
    enabled,
  })
}

/** Đơn hàng đổi kho, điểm khách và chính đơn nên làm mới tất cả. */
function useInvalidateAfterOrder() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all(
      [orderKeys.all, productKeys.all, stockKeys.all, customerKeys.all].map(
        (queryKey) => queryClient.invalidateQueries({ queryKey })
      )
    )
}

export function useCreateOrder() {
  const invalidate = useInvalidateAfterOrder()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersApi.create(input),
    onSuccess: invalidate,
  })
}

/** Mutation cho một bước chuyển trạng thái của đơn `id`. */
function useOrderStep<TVariables = void>(
  run: (variables: TVariables) => Promise<Order>
) {
  const invalidate = useInvalidateAfterOrder()
  return useMutation({ mutationFn: run, onSuccess: invalidate })
}

export const useMarkPaid = (id: string) =>
  useOrderStep(() => ordersApi.markPaid(id))
export const useApproveOrder = (id: string) =>
  useOrderStep(() => ordersApi.approve(id))
export const useHandOverOrder = (id: string) =>
  useOrderStep((trackingCode: string) =>
    ordersApi.handOver(id, { trackingCode })
  )
export const useMarkShipping = (id: string) =>
  useOrderStep(() => ordersApi.markShipping(id))
export const useMarkReady = (id: string) =>
  useOrderStep(() => ordersApi.markReady(id))
export const useCompleteOrder = (id: string) =>
  useOrderStep(() => ordersApi.complete(id))
export const useCancelOrder = (id: string) =>
  useOrderStep((reason: string) => ordersApi.cancel(id, { reason }))

/** Ghi chú chỉ đổi chính đơn, không cần làm mới kho/khách. */
export function useUpdateOrderNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      ordersApi.updateNote(id, note),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order)
      return queryClient.invalidateQueries({
        queryKey: [...orderKeys.all, "list"],
      })
    },
  })
}
