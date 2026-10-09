import { z } from "zod"

import {
  isValidPhone,
  isValidTaxCode,
  normalizePhone,
} from "@/features/customers/lib/customer-validation"
import { PAYMENT_METHODS, SHIPPING_METHODS } from "@/features/sales/constants"
import { isShippingAvailable } from "@/features/sales/lib/order-totals"
import type {
  CreateOrderInput,
  PaymentMethod,
  ShippingMethod,
} from "@/features/sales/types"

const SHIPPING_KEYS = Object.keys(SHIPPING_METHODS) as [
  ShippingMethod,
  ...ShippingMethod[],
]
const PAYMENT_KEYS = Object.keys(PAYMENT_METHODS) as [
  PaymentMethod,
  ...PaymentMethod[],
]

const text = z.string().trim()

export const checkoutSchema = z
  .object({
    customer: z.object({
      id: z.string().optional(),
      name: text.min(2, "Nhập họ tên người đặt"),
      phone: text.refine(
        isValidPhone,
        "Số điện thoại chưa đúng (10 số, đầu 03/05/07/08/09)"
      ),
      email: z.union([z.literal(""), z.email("Email chưa đúng")]),
    }),
    shipping: z.object({
      method: z.enum(SHIPPING_KEYS),
      recipientIsCustomer: z.boolean(),
      recipientName: text,
      recipientPhone: text,
      province: text,
      ward: text,
      /** Id theo danh mục ViettelPost, có khi chọn từ danh sách. */
      provinceId: z.number().int().positive().optional(),
      wardId: z.number().int().positive().optional(),
      street: text,
      note: text,
    }),
    invoice: z.object({
      required: z.boolean(),
      buyerType: z.enum(["personal", "company"]),
      buyerName: text,
      taxCode: text,
      address: text,
      email: text,
    }),
    payment: z.object({
      method: z.enum(PAYMENT_KEYS),
      pointsUsed: z.coerce.number().int().min(0, "Không được âm"),
      collectedNow: z.boolean(),
    }),
    note: text,
  })
  .superRefine((v, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", path, message })

    if (SHIPPING_METHODS[v.shipping.method].requiresAddress) {
      if (!v.shipping.recipientIsCustomer) {
        if (v.shipping.recipientName.length < 2)
          issue(["shipping", "recipientName"], "Nhập tên người nhận")
        if (!isValidPhone(v.shipping.recipientPhone))
          issue(
            ["shipping", "recipientPhone"],
            "Số điện thoại người nhận chưa đúng"
          )
      }
      if (!v.shipping.province)
        issue(["shipping", "province"], "Chọn tỉnh/thành phố")
      if (!v.shipping.ward) issue(["shipping", "ward"], "Chọn phường/xã")
      if (!v.shipping.street)
        issue(["shipping", "street"], "Nhập số nhà, tên đường")
      if (!isShippingAvailable(v.shipping.method, v.shipping.province)) {
        issue(
          ["shipping", "method"],
          `${SHIPPING_METHODS[v.shipping.method].label} không giao tới ${v.shipping.province}`
        )
      }
    }

    if (
      PAYMENT_METHODS[v.payment.method].requiresDelivery &&
      v.shipping.method === "pickup"
    ) {
      issue(["payment", "method"], "Thu hộ chỉ dùng khi giao hàng")
    }

    if (v.invoice.required) {
      const isCompany = v.invoice.buyerType === "company"
      if (v.invoice.buyerName.length < 2) {
        issue(
          ["invoice", "buyerName"],
          isCompany ? "Nhập tên đơn vị" : "Nhập tên người mua"
        )
      }
      if (isCompany && !isValidTaxCode(v.invoice.taxCode)) {
        issue(
          ["invoice", "taxCode"],
          "Mã số thuế gồm 10, 13 (dạng 10-3) hoặc 12 số"
        )
      }
      if (
        !isCompany &&
        v.invoice.taxCode !== "" &&
        !isValidTaxCode(v.invoice.taxCode)
      ) {
        issue(["invoice", "taxCode"], "Mã số thuế chưa đúng")
      }
      if (v.invoice.address.length < 5)
        issue(["invoice", "address"], "Nhập địa chỉ xuất hoá đơn")
      if (!z.email().safeParse(v.invoice.email).success)
        issue(["invoice", "email"], "Nhập email nhận hoá đơn")
    }
  })

export type CheckoutFormInput = z.input<typeof checkoutSchema>
export type CheckoutFormValues = z.output<typeof checkoutSchema>

export const EMPTY_CHECKOUT: CheckoutFormInput = {
  customer: { id: undefined, name: "", phone: "", email: "" },
  shipping: {
    method: "pickup",
    recipientIsCustomer: true,
    recipientName: "",
    recipientPhone: "",
    province: "",
    ward: "",
    provinceId: undefined,
    wardId: undefined,
    street: "",
    note: "",
  },
  invoice: {
    required: false,
    buyerType: "personal",
    buyerName: "",
    taxCode: "",
    address: "",
    email: "",
  },
  payment: { method: "cash", pointsUsed: 0, collectedNow: true },
  note: "",
}

const optional = (value: string) => (value === "" ? undefined : value)

/** Chuyển dữ liệu form thành payload gửi backend. */
export function toCreateOrderInput(
  v: CheckoutFormValues,
  lines: readonly { productId: string; quantity: number }[],
  expectedTotal: number
): CreateOrderInput {
  const needsAddress = SHIPPING_METHODS[v.shipping.method].requiresAddress
  const customerPhone = normalizePhone(v.customer.phone)

  return {
    lines: lines.map(({ productId, quantity }) => ({ productId, quantity })),
    customer: {
      id: v.customer.id,
      name: v.customer.name,
      phone: customerPhone,
      email: optional(v.customer.email),
    },
    shipping: {
      method: v.shipping.method,
      note: optional(v.shipping.note),
      recipient: needsAddress
        ? {
            name: v.shipping.recipientIsCustomer
              ? v.customer.name
              : v.shipping.recipientName,
            phone: v.shipping.recipientIsCustomer
              ? customerPhone
              : normalizePhone(v.shipping.recipientPhone),
            address: {
              province: v.shipping.province,
              ward: v.shipping.ward,
              street: v.shipping.street,
              provinceId: v.shipping.provinceId,
              wardId: v.shipping.wardId,
            },
          }
        : undefined,
    },
    invoice: v.invoice.required
      ? {
          buyerType: v.invoice.buyerType,
          buyerName: v.invoice.buyerName,
          taxCode: optional(v.invoice.taxCode),
          address: v.invoice.address,
          email: v.invoice.email,
        }
      : undefined,
    payment: {
      ...v.payment,
      // Chuyển khoản/COD luôn chờ xác nhận, kể cả khi form còn sót cờ cũ.
      collectedNow: v.payment.method === "cash" && v.payment.collectedNow,
    },
    note: optional(v.note),
    expectedTotal,
  }
}
