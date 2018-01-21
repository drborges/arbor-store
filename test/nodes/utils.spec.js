import sinon from "sinon"
import { expect } from "chai"

import createNode, { ObjectNode } from "../../src/nodes"
import { Path } from "../../src"
import { proxiable, unpack, createMutator } from "../../src/nodes/utils"

const createFakeNode = (value) => {
  const fakeTree = {}
  return createNode(
    fakeTree,
    Path.root,
    value,
  )
}

describe("#proxiable", () => {
  it("returns 'false' for non proxiable values", () => {
    expect(proxiable(null)).to.be.false
    expect(proxiable(undefined)).to.be.false
    expect(proxiable("")).to.be.false
    expect(proxiable("a string")).to.be.false
    expect(proxiable(123)).to.be.false
    expect(proxiable(true)).to.be.false
    expect(proxiable(new Date)).to.be.false
  })

  it("returns 'true' for proxiable values", () => {
    expect(proxiable({ key: "plain object" })).to.be.true
    expect(proxiable([ "plain array" ])).to.be.true
  })
})

describe("#unpack", () => {
  it("unpacks a proxied object", () => {
    const value = { key: "packed value" }
    const proxy = createFakeNode(value)
    const unpacked = unpack(proxy)

    expect(unpacked).to.not.eq(value)
    expect(unpacked).to.deep.eq(value)
  })

  it("unpacks a proxied array", () => {
    const value = [ "packed value" ]
    const proxy = createFakeNode(value)
    const unpacked = unpack(proxy)

    expect(unpacked).to.not.eq(value)
    expect(unpacked).to.deep.eq(value)
  })

  it("unpacks a non-proxied value", () => {
    const value = "not a proxy"
    const unpacked = unpack(value)

    expect(unpacked).to.eq(value)
  })

  it("unpacks a null value", () => {
    const value = null
    const unpacked = unpack(value)

    expect(unpacked).to.be.null
  })

  it("unpacks an undefined value", () => {
    const value = undefined
    const unpacked = unpack(value)

    expect(unpacked).to.be.undefined
  })
})


describe("#createMutator", () => {
  it("deeply mutates node applying structural sharing", () => {
    const value = {
      users: [
        { name: "Snow" },
        { name: "Jon" },
      ]
    }

    const originalUsers = value.users
    const originalUser0 = value.users[0]
    const originalUser1 = value.users[1]

    const mutator = createMutator(value)
    mutator.users[1].name = "Snow"

    expect(value).to.deep.eq({
      users: [
        { name: "Snow" },
        { name: "Snow" },
      ]
    })

    expect(value.users).to.not.eq(originalUsers)
    expect(value.users[0]).to.eq(originalUser0)
    expect(value.users[1]).to.not.eq(originalUser1)
  })

  it("deeply mutates node unpack value", () => {
    const value = {
      users: [
        { name: "Snow" },
        { name: "Jon" },
      ]
    }

    const mutator = createMutator(value)
    mutator.users[1] = createFakeNode({ name: "Stark" })

    expect(value).to.deep.eq({
      users: [
        { name: "Snow" },
        { name: "Stark" },
      ]
    })

    expect(value.users[1].name).to.eq("Stark")
    expect(value.users[1]).to.not.be.an.instanceof(ObjectNode)
  })
})
