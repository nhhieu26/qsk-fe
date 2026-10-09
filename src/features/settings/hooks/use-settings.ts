import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { settingsApi } from "@/features/settings/api/settings-api"
import type {
  ShopSettings,
  UpdatePaymentAccountInput,
  UpdateStoreInput,
} from "@/features/settings/types"

export const settingsKeys = {
  all: ["settings"] as const,
}

export function useSettings() {
  return useQuery({ queryKey: settingsKeys.all, queryFn: settingsApi.get })
}

/** Response đã là bản cài đặt mới nhất nên ghi thẳng vào cache, khỏi tải lại. */
function useSaveSettings<Input>(save: (input: Input) => Promise<ShopSettings>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: save,
    onSuccess: (settings) =>
      queryClient.setQueryData(settingsKeys.all, settings),
  })
}

export function useUpdateStore() {
  return useSaveSettings((input: UpdateStoreInput) =>
    settingsApi.updateStore(input)
  )
}

export function useUpdatePaymentAccount() {
  return useSaveSettings((input: UpdatePaymentAccountInput) =>
    settingsApi.updatePaymentAccount(input)
  )
}
