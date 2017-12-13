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
})
