import axios, { isAxiosError } from "axios"

export interface ApiResponse<T> {
  success: true
  message?: string
  data: T
}

/** Lỗi theo từng field backend trả khi validate thất bại (HTTP 400). */
export type FieldErrors = Readonly<Record<string, readonly string[]>>

export class ApiError extends Error {
  readonly status?: number
  readonly fieldErrors?: FieldErrors

  constructor(message: string, status?: number, fieldErrors?: FieldErrors) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function isFieldErrors(value: unknown): value is FieldErrors {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every(
      (v) => Array.isArray(v) && v.every((m) => typeof m === "string")
    )
  )
}

export const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError<{ message?: string; details?: unknown }>(error)) {
      const data = error.response?.data
      const message = data?.message ?? "Không kết nối được máy chủ"
      const fieldErrors = isFieldErrors(data?.details)
        ? data.details
        : undefined
      return Promise.reject(
        new ApiError(message, error.response?.status, fieldErrors)
      )
    }
    return Promise.reject(error)
  }
)
