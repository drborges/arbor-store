import sinon from "sinon"
import { expect } from "chai"

import { NodeFactory, ArrayNode, ObjectNode } from "../src"

describe("#NodeFactory", () => {
  const tree = {}

  it("creates an object node at a given state tree path for a given object literal", () => {
    const factory = new NodeFactory(tree)
    const path = "/todos/0"
    const value = { status: "todo" }
    const node = factory.create(path, value)

    expect(node.$path).to.eq(path)
    expect(node.$value).to.eq(value)
    expect(node.constructor).to.eq(ObjectNode)
  })

  it("creates an array node at a given state tree path for a given array literal", () => {
    class Todos extends Array {}
    const factory = new NodeFactory(tree)
    const path = "/todos"
    const value = []
    const node = factory.create(path, value)

    expect(node.$path).to.eq(path)
    expect(node.$value).to.eq(value)
    expect(node).to.be.an.instanceOf(Array)
  })

  it("creates an object node at a given state tree path for a class instance", () => {
    class Todo {}
    const factory = new NodeFactory(tree)
    const path = "/todos/0"
    const value = new Todo
    const node = factory.create(path, value)

    expect(node.$path).to.eq(path)
    expect(node.$value).to.eq(value)
    expect(node).to.be.an.instanceOf(Todo)
  })

  it("creates an array node at a given state tree path for a given custom array class", () => {
    class Todos extends Array {}
    const factory = new NodeFactory(tree)
    const path = "/todos"
    const value = new Todos
    const node = factory.create(path, value)

    expect(node.$path).to.eq(path)
    expect(node.$value).to.eq(value)
    expect(node).to.be.an.instanceOf(Array)
  })
})
