import sinon from "sinon"
import { expect } from "chai"

import Tree from "../../src/ptree"

describe("Node", () => {
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
