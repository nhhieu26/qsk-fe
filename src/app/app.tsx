import { QueryProvider } from "@/app/query-provider"
import { AppRouterProvider } from "@/app/router-provider"
import { Toaster } from "@/components/ui/sonner"

export function App() {
  return (
    <QueryProvider>
      <AppRouterProvider />
      <Toaster position="bottom-center" richColors />
    </QueryProvider>
  )
}
