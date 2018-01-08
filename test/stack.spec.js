import sinon from "sinon"
import { expect } from "chai"

import Stack from "../src/stack"

describe("Stack", () => {
  describe("#push", () => {
    it("pushes new items into the stack", () => {
      const stack = new Stack
      stack.push(1)
      stack.push(2)

      expect(stack.items).to.deep.eq([1, 2])
    })
  })

  describe("#pop", () => {
    it("pops items from the stack", () => {
      const stack = new Stack
      stack.push(1)
      stack.push(2)

      const popped = stack.pop()

      expect(popped).to.eq(2)
      expect(stack.items).to.deep.eq([1])
    })
  })

  describe("#clear", () => {
    it("clears out all items from the stack", () => {
      const stack = new Stack
      stack.push(1)
      stack.push(2)

      stack.clear()

      expect(stack.items).to.be.empty
    })
  })

  describe("#peek", () => {
    it("peeks at the top of the stack", () => {
      const stack = new Stack
      stack.push(1)
      stack.push(2)

      const item = stack.peek()

      expect(item).to.eq(2)
      expect(stack.items).to.deep.eq([1, 2])
    })
  })

  describe("#length", () => {
    it("gets the stack's length", () => {
      const stack = new Stack
      stack.push(1)
      stack.push(2)

      expect(stack.length).to.eq(2)
    })
  })
})
