import { z } from "zod"

import { isValidPhone } from "@/features/customers/lib/customer-validation"
import { BANKS } from "@/features/sales/constants"

/** Mã điểm: chữ hoa + số, tối đa 6 ký tự (giống backend). */
export const STORE_CODE_MAX = 6

export function normalizeStoreCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "")
}

export const storeSchema = z.object({
  name: z.string().trim().min(2, "Nhập tên điểm"),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || isValidPhone(v), "Số điện thoại chưa đúng"),
  address: z.string().trim(),
  code: z
    .string()
    .transform(normalizeStoreCode)
    .refine((v) => v.length <= STORE_CODE_MAX, "Mã điểm tối đa 6 ký tự"),
})

export type StoreFormInput = z.input<typeof storeSchema>
export type StoreFormValues = z.output<typeof storeSchema>

const BANK_BINS: readonly string[] = BANKS.map((b) => b.bin)

export const paymentAccountSchema = z.object({
  bankBin: z.string().refine((v) => BANK_BINS.includes(v), "Chọn ngân hàng"),
  accountNumber: z
    .string()
    .transform((v) => v.replace(/\s+/g, ""))
    .refine((v) => /^[0-9A-Za-z]{4,19}$/.test(v), "Số tài khoản chưa đúng"),
  accountName: z
    .string()
    .trim()
    .min(2, "Nhập tên chủ tài khoản")
    .transform((v) => v.toUpperCase()),
})

export type PaymentAccountFormInput = z.input<typeof paymentAccountSchema>
export type PaymentAccountFormValues = z.output<typeof paymentAccountSchema>

/** Số tiền + nội dung của mã QR thử, để chủ quầy quét kiểm tra tài khoản. */
export const TEST_QR = { amount: 2_000, content: "QSKTHU" } as const
