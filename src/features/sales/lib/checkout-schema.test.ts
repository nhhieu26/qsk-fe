import { describe, expect, it } from "vitest"

import {
  checkoutSchema,
  EMPTY_CHECKOUT,
  toCreateOrderInput,
  type CheckoutFormInput,
} from "@/features/sales/lib/checkout-schema"

function form(overrides: {
  customer?: Partial<CheckoutFormInput["customer"]>
  shipping?: Partial<CheckoutFormInput["shipping"]>
  invoice?: Partial<CheckoutFormInput["invoice"]>
  payment?: Partial<CheckoutFormInput["payment"]>
}): CheckoutFormInput {
  return {
    ...EMPTY_CHECKOUT,
    customer: {
      ...EMPTY_CHECKOUT.customer,
      name: "Nguyễn Lan",
      phone: "0912 345 678",
      ...overrides.customer,
    },
    shipping: { ...EMPTY_CHECKOUT.shipping, ...overrides.shipping },
    invoice: { ...EMPTY_CHECKOUT.invoice, ...overrides.invoice },
    payment: { ...EMPTY_CHECKOUT.payment, ...overrides.payment },
  }
}

const ADDRESS = {
  province: "Hà Nội",
  ward: "Phường Hà Đông",
  street: "12 Quang Trung",
}

function errorPaths(input: CheckoutFormInput): string[] {
  const result = checkoutSchema.safeParse(input)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

describe("checkoutSchema", () => {
  it("accepts a minimal pickup order", () => {
    expect(errorPaths(form({}))).toEqual([])
  })

  it("rejects an invalid phone number", () => {
    expect(errorPaths(form({ customer: { phone: "12345" } }))).toContain(
      "customer.phone"
    )
  })

  it("requires an address for delivery", () => {
    const paths = errorPaths(form({ shipping: { method: "viettel" } }))
    expect(paths).toEqual(
      expect.arrayContaining([
        "shipping.province",
        "shipping.ward",
        "shipping.street",
      ])
    )
  })

  it("requires recipient details when the recipient is someone else", () => {
    const paths = errorPaths(
      form({
        shipping: { method: "viettel", recipientIsCustomer: false, ...ADDRESS },
      })
    )
    expect(paths).toEqual(
      expect.arrayContaining([
        "shipping.recipientName",
        "shipping.recipientPhone",
      ])
    )
  })

  it("rejects express delivery outside the store province", () => {
    const paths = errorPaths(
      form({ shipping: { method: "express", ...ADDRESS, province: "Đà Nẵng" } })
    )
    expect(paths).toContain("shipping.method")
  })

  it("rejects COD for pickup", () => {
    expect(errorPaths(form({ payment: { method: "cod" } }))).toContain(
      "payment.method"
    )
  })

  it("requires a valid tax code for company invoices", () => {
    const paths = errorPaths(
      form({
        invoice: {
          required: true,
          buyerType: "company",
          buyerName: "Công ty A",
          taxCode: "123",
          address: "1 Lê Lợi, Hà Nội",
          email: "a@b.vn",
        },
      })
    )
    expect(paths).toEqual(["invoice.taxCode"])
  })

  it("accepts a branch tax code in 10-3 form", () => {
    const paths = errorPaths(
      form({
        invoice: {
          required: true,
          buyerType: "company",
          buyerName: "Công ty A",
          taxCode: "0101234567-001",
          address: "1 Lê Lợi, Hà Nội",
          email: "a@b.vn",
        },
      })
    )
    expect(paths).toEqual([])
  })

  it("ignores invoice fields when no invoice is requested", () => {
    expect(
      errorPaths(form({ invoice: { required: false, taxCode: "bad" } }))
    ).toEqual([])
  })
})

describe("toCreateOrderInput", () => {
  it("never marks a transfer as collected at creation", () => {
    const values = checkoutSchema.parse(
      form({ payment: { method: "transfer", collectedNow: true } })
    )
    const input = toCreateOrderInput(
      values,
      [{ productId: "p1", quantity: 1 }],
      1
    )
    expect(input.payment.collectedNow).toBe(false)
  })

  it("keeps the collected flag for cash", () => {
    const values = checkoutSchema.parse(
      form({ payment: { method: "cash", collectedNow: true } })
    )
    const input = toCreateOrderInput(
      values,
      [{ productId: "p1", quantity: 1 }],
      1
    )
    expect(input.payment.collectedNow).toBe(true)
  })

  it("uses the customer as recipient and normalizes the phone", () => {
    const values = checkoutSchema.parse(
      form({ shipping: { method: "viettel", ...ADDRESS } })
    )
    const input = toCreateOrderInput(
      values,
      [{ productId: "p1", quantity: 2 }],
      280_000
    )
    expect(input.shipping.recipient).toEqual({
      name: "Nguyễn Lan",
      phone: "0912345678",
      address: ADDRESS,
    })
  })

  it("drops the recipient for pickup and the invoice when not requested", () => {
    const values = checkoutSchema.parse(form({}))
    const input = toCreateOrderInput(
      values,
      [{ productId: "p1", quantity: 1 }],
      100_000
    )
    expect(input.shipping.recipient).toBeUndefined()
    expect(input.invoice).toBeUndefined()
  })
})
