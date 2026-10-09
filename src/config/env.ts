/** Biến môi trường frontend, đọc một lần tại đây rồi import nơi cần. */
export const env = {
  useMockApi: import.meta.env.VITE_USE_MOCK_API === "true",
} as const
