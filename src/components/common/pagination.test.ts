import { describe, expect, it } from "vitest"

import { pageItems } from "@/components/common/pagination"

describe("pageItems", () => {
  it("lists every page when there are few", () => {
    expect(pageItems(2, 4)).toEqual([1, 2, 3, 4])
  })

  it("collapses distant pages into gaps", () => {
    expect(pageItems(10, 20)).toEqual([1, "gap", 9, 10, 11, "gap", 20])
  })

  it("shows a single missing page instead of a gap", () => {
    expect(pageItems(4, 20)).toEqual([1, 2, 3, 4, 5, "gap", 20])
  })

  it("handles a single page", () => {
    expect(pageItems(1, 1)).toEqual([1])
  })
})
