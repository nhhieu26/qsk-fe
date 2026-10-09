import { describe, expect, it } from "vitest"

import type { User } from "@/features/auth/api/auth"
import { PERMISSIONS } from "@/features/access/permissions"
import {
  hasPermission,
  resolvePermissions,
} from "@/features/access/resolve-permissions"

function userFixture(overrides: Partial<User> = {}): User {
  return {
    _id: "u1",
    accountId: "a1",
    phoneNumber: "0900000000",
    role: "customer",
    permissions: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("resolvePermissions", () => {
  it("grants counter permissions from the role", () => {
    const user = userFixture({ role: "customer" })
    expect(resolvePermissions(user).has(PERMISSIONS.salesCreate)).toBe(true)
  })

  it("keeps admin permissions sent by backend", () => {
    const user = userFixture({ role: "midu", permissions: ["users:read"] })
    expect([...resolvePermissions(user)]).toEqual(["users:read"])
  })

  it("gives superadmin the wildcard", () => {
    const user = userFixture({ role: "superadmin" })
    expect(resolvePermissions(user).has("*")).toBe(true)
  })

  it("gives midu staff no counter permissions", () => {
    const user = userFixture({ role: "midu" })
    expect(resolvePermissions(user).size).toBe(0)
  })
})

describe("hasPermission", () => {
  it("matches an exact permission", () => {
    expect(
      hasPermission(new Set(["products.view"]), PERMISSIONS.productsView)
    ).toBe(true)
  })

  it("matches the global wildcard", () => {
    expect(hasPermission(new Set(["*"]), PERMISSIONS.settingsView)).toBe(true)
  })

  it("matches a module wildcard", () => {
    expect(hasPermission(new Set(["stock.*"]), PERMISSIONS.stockAdjust)).toBe(
      true
    )
  })

  it("does not leak a module wildcard into other modules", () => {
    expect(hasPermission(new Set(["stock.*"]), PERMISSIONS.productsView)).toBe(
      false
    )
  })

  it("denies when the permission is missing", () => {
    expect(
      hasPermission(new Set(["products.view"]), PERMISSIONS.productsUpdate)
    ).toBe(false)
  })
})
