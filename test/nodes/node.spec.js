import sinon from "sinon"
import { expect } from "chai"

import Cache from "../../src/nodes/cache"
import Arbor, { Node, ArrayNode, ObjectNode } from "../../src"

describe("Node", () => {
  describe("#constructor", () => {
    it("is an abstract class and cannot be directly constructed", () => {
      expect(() => new Node()).to.throw()
    })
  })

  describe("#set", () => {
    it("assigns a primitive value to the node", () => {
      const tree = new Arbor({
        user: { name: "Jon" },
      })

      tree.root.user = "some data"

      expect(tree.root.user).to.eq("some data")
    })

    it("assigns an undefined value to the node", () => {
      const tree = new Arbor({
        user: { name: "Jon" },
      })

      tree.root.user = undefined

      expect(tree.root.user).to.be.undefined
    })

    it("assigns a null value to the node", () => {
      const tree = new Arbor({
        user: { name: "Jon" },
      })

      tree.root.user = null

      expect(tree.root.user).to.eq(null)
    })

    it("assigns an object value to the node", () => {
      const tree = new Arbor({
        user: { name: "Jon" },
      })

      tree.root.user = { name: "Bob" }

      expect(tree.root.user.constructor).to.eq(ObjectNode)
    })

    it("assigns an array value to the node", () => {
      const tree = new Arbor({
        user: { name: "Jon" },
      })

      tree.root.user = [ "Bob" ]

      expect(tree.root.user.constructor).to.eq(ArrayNode)
    })

    it("assigns an arbor node value to the node", () => {
      const tree = new Arbor({
        users: [{ name: "Jon" }, { name: "Snow" }],
      })

      const firstUser = tree.root.users[0]
      const lastUser = tree.root.users[1]

      tree.root.users[0] = lastUser

      expect(tree.root.users[0].constructor).to.eq(ObjectNode)
      expect(tree.root.users[1].constructor).to.eq(ObjectNode)
      expect(tree.root.users[0].$path.toString()).to.eq("/users/0")
      expect(tree.root.users[1].$path.toString()).to.eq("/users/1")
    })
  })

  describe("#get", () => {
    it("returns raw value when accessing leaf nodes", () => {
      const state = {
        user: {
          name: "Jon",
          age: 32,
          password: null,
          dob: new Date(1980, 1, 1),
        }
      }

      const tree = new Arbor(state)

      expect(tree.root.user.name).to.eq(state.user.name)
      expect(tree.root.user.age).to.eq(state.user.age)
      expect(tree.root.user.email).to.be.undefined
      expect(tree.root.user.password).to.eq(null)
      expect(tree.root.user.dob).to.eq(state.user.dob)
      expect(tree.root.user.dob.constructor).to.eq(Date)
    })

    it("caches tree node upon first access", () => {
      const state = { users: [{ name: "Jon" }, { name: "Snow" }] }
      const tree = new Arbor(state)

      expect(tree.root.$children.has(state.users)).to.be.false

      tree.root.users

      expect(tree.root.$children.has(state.users)).to.be.true

      expect(tree.root.users.$children.has(state.users[0])).to.be.false
      expect(tree.root.users.$children.has(state.users[1])).to.be.false

      tree.root.users[0]
      tree.root.users[1]

      expect(tree.root.users.$children.has(state.users[0])).to.be.true
      expect(tree.root.users.$children.has(state.users[1])).to.be.true
    })
  })

  describe("#$refresh", () => {
    it("refreshes node cache", () => {
      const state = { user: { name: "Jon" } }
      const tree = new Arbor(state)

      tree.root.user

      expect(tree.root.$children.has(state.user)).to.be.true

      const node = tree.root.$refresh()

      expect(node).to.eq(tree.root)
      expect(tree.root.$children.has(state.user)).to.be.false
    })
  })

  describe("#$refreshChild", () => {
    it("replaces child with a copy", () => {
      const state = { user: { name: "Jon" } }
      const tree = new Arbor(state)

      const originalUser = tree.root.user

      const refreshed = tree.root.$refreshChild("user")

      expect(tree.root.user).to.not.eq(originalUser)
      expect(tree.root.user).to.eq(refreshed)

      expect(tree.root.user.$value).to.not.eq(originalUser.$value)
      expect(tree.root.user.$value).to.eq(refreshed.$value)
    })
  })

  describe("#$transactionPath", () => {
    it("constructs a trnasaction path for a given node", () => {
      const tree = new Arbor({ user: { name: "Jon" } })

      expect(tree.root.user.$transactionPath.toString()).to.eq("/user/.*")
    })
  })

  describe("#$copy", () => {
    it("creates a copy of the node", () => {
      const tree = new Arbor({ users: [{ name: "Jon" }] })

      const originalUsers = tree.root.users
      const copy = originalUsers.$copy()

      expect(originalUsers).to.not.eq(copy)
      expect(originalUsers).to.deep.eq(copy)
      expect(originalUsers.$path).to.eq(copy.$path)
      expect(originalUsers.$value).to.not.eq(copy.$value)
      expect(originalUsers.$value).to.deep.eq(copy.$value)
      expect(originalUsers.$children).to.eq(copy.$children)
    })
  })

  describe("#proxify", () => {
    it("creates a new child node", () => {
      const tree = new Arbor({ users: [{ name: "Jon" }] })
      const value = { name: "Snow" }
      const proxy = tree.root.users.$proxify(1, value)

      expect(proxy.constructor).to.eq(ObjectNode)
      expect(proxy.$tree).to.eq(tree)
      expect(proxy.$path.toString()).to.eq("/users/1")
      expect(proxy.$value).to.eq(value)
      expect(proxy.$children).to.be.an.instanceof(Cache)
    })
  })
})
