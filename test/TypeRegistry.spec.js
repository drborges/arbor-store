import sinon from "sinon"
import { expect } from "chai"

import Path from "../src/Path"
import TypeRegistry from "../src/TypeRegistry"

describe("TypeRegistry", () => {
  describe("#register", () => {
    it("registers a Type to be bound to a given state tree path", () => {
      class Todos {}
      const path = Path.parse("/todos")

      const registry = new TypeRegistry
      registry.register(path, Todos)

      expect(registry.types).to.deep.eq({
        [path.toString()]: Todos,
      })
    })
  })

  describe("#fetch", () => {
    it("fetches type register under a specific path", () => {
      class Todos {}
      const path = Path.parse("/todos")
      const registry = new TypeRegistry

      registry.register(path, Todos)
      const type = registry.fetch(path)

      expect(type).to.eq(Todos)
    })

    it("does not find any registered type for given path", () => {
      const path = Path.parse("/todos")
      const registry = new TypeRegistry

      const type = registry.fetch(path)

      expect(type).to.be.undefined
    })

    it("fetches type register under a path pattern", () => {
      class Comment {}
      const path = Path.parse("/todos/0/comments/1")
      const pattern = Path.parse("/todos/:index/comments/:index")
      const registry = new TypeRegistry

      registry.register(pattern, Comment)
      const type = registry.fetch(path)

      expect(type).to.eq(Comment)
    })
  })
})
