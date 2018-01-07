import sinon from "sinon"
import { expect } from "chai"

import Registry from "../../src/model/registry"

describe("Registry", () => {
  describe("#register", () => {
    it("registers a model type to a given path", () => {
      class Post {}

      const registry = new Registry
      const path = "/users/:index/posts/:post"

      registry.register(path, Post)

      expect(registry.models).to.deep.eq({
        [path]: Post,
      })
    })
  })

  describe("#fetch", () => {
    it("fetches a model type for a registered path", () => {
      class Post {}

      const registry = new Registry
      const path = "/users/:index/posts/:post"

      registry.register(path, Post)

      expect(registry.fetch(path)).to.eq(Post)
      expect(registry.fetch("/users")).to.be.undefined
    })
  })
})
