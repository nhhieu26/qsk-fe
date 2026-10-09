import { describe, expect, it } from "vitest"

import {
  normalizeStoreCode,
  paymentAccountSchema,
  storeSchema,
} from "@/features/settings/lib/settings-schema"

describe("storeSchema", () => {
  it("chuẩn hoá mã điểm thành chữ hoa, bỏ ký tự lạ", () => {
    expect(normalizeStoreCode("vp-01 ")).toBe("VP01")
  })

  it("chấp nhận số điện thoại trống", () => {
    const result = storeSchema.safeParse({
      name: "Quầy Văn Phúc",
      phone: "",
      address: "",
      code: "",
    })
    expect(result.success).toBe(true)
  })

  it("từ chối tên quá ngắn và mã điểm quá 6 ký tự", () => {
    const result = storeSchema.safeParse({
      name: "Q",
      phone: "",
      address: "",
      code: "ABCDEFG",
    })
    const paths = result.error?.issues.map((i) => i.path.join("."))
    expect(paths).toEqual(expect.arrayContaining(["name", "code"]))
  })
})

describe("paymentAccountSchema", () => {
  it("bỏ khoảng trắng số tài khoản, viết hoa chủ tài khoản", () => {
    const result = paymentAccountSchema.parse({
      bankBin: "970436",
      accountNumber: "0011 0012 34567",
      accountName: "Quay Suc Khoe",
    })
    expect(result).toEqual({
      bankBin: "970436",
      accountNumber: "0011001234567",
      accountName: "QUAY SUC KHOE",
    })
  })

  it("từ chối ngân hàng chưa chọn và số tài khoản quá ngắn", () => {
    const result = paymentAccountSchema.safeParse({
      bankBin: "",
      accountNumber: "12",
      accountName: "AB",
    })
    const paths = result.error?.issues.map((i) => i.path.join("."))
    expect(paths).toEqual(expect.arrayContaining(["bankBin", "accountNumber"]))
  })
})
