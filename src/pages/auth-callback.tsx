import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"

import { Button } from "@/components/ui/button"
import { authApi } from "@/features/auth/api/auth"
import { useSetCurrentUser } from "@/features/auth/hooks/use-auth"

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setCurrentUser = useSetCurrentUser()
  const [exchangeError, setExchangeError] = useState<string | null>(null)
  const handled = useRef(false)

  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error =
    !code || !state
      ? "Thiếu mã xác thực từ MIDU, vui lòng đăng nhập lại"
      : exchangeError

  useEffect(() => {
    if (!code || !state || handled.current) return
    handled.current = true

    authApi
      .ssoCallback({ code, state })
      .then((user) => {
        setCurrentUser(user)
        navigate("/", { replace: true })
      })
      .catch((err: Error) => setExchangeError(err.message))
  }, [code, state, navigate, setCurrentUser])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      {error ? (
        <>
          <p className="text-destructive">{error}</p>
          <Button asChild variant="outline">
            <Link to="/login" replace>
              Quay lại đăng nhập
            </Link>
          </Button>
        </>
      ) : (
        <p className="text-muted-foreground">Đang đăng nhập…</p>
      )}
    </div>
  )
}
