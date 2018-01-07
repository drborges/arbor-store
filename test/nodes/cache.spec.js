import sinon from "sinon"
import { expect } from "chai"

import Cache from "../../src/nodes/cache"

describe("Cache", () => {
  describe("#set", () => {
    it("adds an item to the cache", () => {
      const cache = new Cache
      const key = {}

      cache.set(key, "data")

      expect(cache.items.has(key)).to.be.true
    })
  })

  describe("#get", () => {
    it("retrieves an item from the cache", () => {
      const cache = new Cache
      const key = {}

      cache.set(key, "data")

      expect(cache.get(key)).to.eq("data")
    })
  })

  describe("#has", () => {
    it("checks whether an item is in the cache", () => {
      const cache = new Cache
      const key1 = {}
      const key2 = {}

      cache.set(key1, "data")

      expect(cache.has(key1)).to.be.true
      expect(cache.has(key2)).to.be.false
    })
  })

  describe("#clear", () => {
    it("clears out cache", () => {
      const cache = new Cache
      const key1 = {}
      const key2 = {}

      cache.set(key1, "data")
      cache.set(key2, "more data")
      cache.clear()

      expect(cache.has(key1)).to.be.false
      expect(cache.has(key2)).to.be.false
    })
  })
})
