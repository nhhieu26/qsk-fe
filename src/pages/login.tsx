import { Navigate } from "react-router"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authApi } from "@/features/auth/api/auth"
import { useCurrentUser } from "@/features/auth/hooks/use-auth"

export function LoginPage() {
  const { data: user } = useCurrentUser()

  if (user) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-svh items-center justify-center bg-linear-to-br from-primary/15 via-primary/5 to-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <img
            src="/logo.png"
            alt="Quầy Sức Khỏe"
            className="mx-auto w-56 justify-self-center"
          />
          <CardTitle className="sr-only">Đăng nhập</CardTitle>
          <CardDescription>Điểm Vạn Phúc</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            className="h-11 w-full text-base"
            onClick={() => window.location.assign(authApi.ssoLoginUrl())}
          >
            Đăng nhập bằng MIDU
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
