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

  describe(".constructor", () => {
    it("caches paths based on their props", () => {
      expect(new Path).to.eq(new Path)
      expect(new Path(["todos"])).to.eq(new Path(["todos"]))
      expect(Path.parse("/todos/0")).to.eq(Path.parse("/todos/0"))
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

  describe("#complement", () => {
    it("returns the complementary path computed against the given one", () => {
      const path1 = Path.parse("/todos/0")
      const path2 = Path.parse("/todos/0/comments/2")
      const complement = path1.complement(path2)

      expect(complement).to.deep.eq(Path.parse("/comments/2"))
    })

    it("returns an empty path if paths are the same", () => {
      const path1 = Path.parse("/todos/0")
      const path2 = Path.parse("/todos/0")
      const complement = path1.complement(path2)

      expect(complement).to.eq(new Path)
    })

    it("returns an empty path if there is no path intersection", () => {
      const path1 = Path.parse("/todos/0")
      const path2 = Path.parse("/does/not/intersect")
      const complement = path1.complement(path2)

      expect(complement).to.deep.eq(new Path)
    })

    it("returns the target path when computing complement off of root path", () => {
      const path1 = Path.parse("/")
      const path2 = Path.parse("/todos/0")
      const complement = path1.complement(path2)

      expect(complement).to.deep.eq(path2)
    })
  })
})
