import { beforeEach, describe, expect, it } from "vitest"

import { useCartStore } from "@/features/sales/store/cart-store"

const tea = { id: "p1", name: "Trà", price: 95_000 }
const mat = { id: "p2", name: "Thảm", price: 250_000 }

describe("cart store", () => {
  beforeEach(() => useCartStore.setState({ cart: [], buyNow: [] }))

  it("adds a new product to the chosen source only", () => {
    useCartStore.getState().startBuyNow(tea)
    useCartStore.getState().addLine("buyNow", mat, 5)
    const { cart, buyNow } = useCartStore.getState()
    expect(buyNow.map((l) => l.productId)).toEqual(["p1", "p2"])
    expect(cart).toEqual([])
  })

  it("increments an existing line instead of duplicating it", () => {
    useCartStore.getState().addLine("cart", tea, 5)
    useCartStore.getState().addLine("cart", tea, 5)
    expect(useCartStore.getState().cart).toEqual([
      { productId: "p1", name: "Trà", price: 95_000, quantity: 2 },
    ])
  })

  it("refuses to exceed the stock", () => {
    const { addLine } = useCartStore.getState()
    expect(addLine("cart", tea, 1)).toBe(true)
    expect(addLine("cart", tea, 1)).toBe(false)
    expect(useCartStore.getState().cart[0]?.quantity).toBe(1)
  })

  it("refuses an out-of-stock product", () => {
    expect(useCartStore.getState().addLine("cart", tea, 0)).toBe(false)
    expect(useCartStore.getState().cart).toEqual([])
  })

  it("removes a line", () => {
    useCartStore.getState().addLine("cart", tea, 5)
    useCartStore.getState().removeLine("cart", "p1")
    expect(useCartStore.getState().cart).toEqual([])
  })
})
