import sinon from "sinon"
import { expect } from "chai"

import Path from "../src/Path"

describe("Path", () => {
  describe("#toString", () => {
    it("represents root path object using URI notation", () => {
      expect(new Path().toString()).to.eq("/")
    })

    it("represents path objects using URI notation", () => {
      expect(new Path(["todos", "0", "title"]).toString()).to.eq("/todos/0/title")
    })
  })

  describe(".parse", () => {
    it("parses an empty string into a root Path object", () => {
      expect(Path.parse("")).to.deep.eq(new Path)
    })

    it("parses a root URI string into a root Path object", () => {
      expect(Path.parse("/")).to.deep.eq(new Path)
    })

    it("parses a URI string into a Path object", () => {
      expect(Path.parse("/todos/0/title")).to.deep.eq(new Path(["todos", "0", "title"]))
    })
  })

  describe(".root", () => {
    it("constructs a root path object", () => {
      expect(Path.root).to.deep.eq(new Path)
    })
  })

  describe("#child", () => {
    it("constructs a child path object", () => {
      const parent = new Path(["todos"])
      const child = parent.child("0")
      expect(child).to.deep.eq(new Path(["todos", "0"]))
    })
  })

  describe("#match", () => {
    it("matches a path object with wildcards", () => {
      const pattern = new Path(["todos", ":index", "comments", ":index"])
      const path = new Path(["todos", "0", "comments", "2"])

      expect(path.match(pattern)).to.eq(true)
    })

    it("does not match a path object with wildcards", () => {
      const pattern = new Path(["todos", ":index", "comments", "1"])
      const path = new Path(["todos", "0", "comments", "2"])

      expect(path.match(pattern)).to.eq(false)
    })

    it("matches a path string with wildcards", () => {
      const pattern = "/todos/:index/comments/:index"
      const path = new Path(["todos", "0", "comments", "2"])

      expect(path.match(pattern)).to.eq(true)
    })

    it("does not match a path string with wildcards", () => {
      const pattern = "/todos/:index/comments/1"
      const path = new Path(["todos", "0", "comments", "2"])

      expect(path.match(pattern)).to.eq(false)
    })
  })
})
