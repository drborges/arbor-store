import sinon from "sinon"
import { expect } from "chai"

import Tree from "../../../src/ptree"

describe("Node", () => {
  describe("#get", () => {
    it("allows accessing methods only defined on the proxied target value", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" }
        ]
      })

      expect(tree.root.users.hasOwnProperty(0)).to.eq(true)
    })

    it("does not evaluate 'falsy' props as 'undefined'", () => {
      const tree = new Tree({
        active: false,
        emptyText: "",
        zero: 0,
      })

      expect(tree.root.active).to.eq(false)
      expect(tree.root.emptyText).to.eq("")
      expect(tree.root.zero).to.eq(0)
    })

    it("returns 'null' for null props in target", () => {
      const tree = new Tree({
        data: null,
      })

      expect(tree.root.data).to.eq(null)
    })
  })

  describe("#set", () => {
    it("allows setting $children prop", () => {
      const tree = new Tree({
        user: { name: "Diego" }
      })

      expect(tree.root.user.$children).to.deep.eq({})

      tree.root.user.$children = { child: "fake child" }

      expect(tree.root.user.$children).to.deep.eq({ child: "fake child" })
    })

    it("allows setting $value prop", () => {
      const tree = new Tree({
        user: { name: "Diego" }
      })

      expect(tree.root.user.$value).to.deep.eq({ name: "Diego" })

      tree.root.user.$value = { child: "fake child" }

      expect(tree.root.user.$value).to.deep.eq({ child: "fake child" })
    })
  })
})
