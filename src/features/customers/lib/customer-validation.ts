import type { Address } from "@/features/customers/types"

/** Số di động Việt Nam: 0 hoặc +84, đầu số 3/5/7/8/9, tổng 10 số. */
const VN_PHONE = /^(?:0|\+84)(?:3|5|7|8|9)\d{8}$/

/** Mã số thuế: 10 số, 10 số + "-" + 3 số (chi nhánh), hoặc 12 số (cá nhân theo CCCD). */
const TAX_CODE = /^(?:\d{10}(?:-\d{3})?|\d{12})$/

export function normalizePhone(value: string): string {
  return value.replace(/[\s.-]/g, "")
}

export function isValidPhone(value: string): boolean {
  return VN_PHONE.test(normalizePhone(value))
}

export function isValidTaxCode(value: string): boolean {
  return TAX_CODE.test(value.trim())
}

export function formatAddress(address: Address): string {
  return [address.street, address.ward, address.province]
    .filter((p) => p.trim() !== "")
    .join(", ")
}
