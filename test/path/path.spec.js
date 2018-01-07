import { expect } from "chai"
import Path from "../../src/path"

describe("Path", () => {
  describe("#toString", () => {
    it("overrides #toString() with a more readable output", () => {
      const path = new Path("users", "0", "comments")

      expect(path.toString()).to.equal("/users/0/comments")
    })
  })

  describe("#child", () => {
    it("creates a child path", () => {
      const path = new Path("users", "0")
      const child = path.child("comments")

      expect(child.toString()).to.equal("/users/0/comments")
    })
  })

  describe("cache", () => {
    it("caches path instances to avoid memory leaks", () => {
      const path1 = new Path("users", "0", "comments")
      const path2 = new Path("users", "0", "comments")

      expect(path1).to.equal(path2)
    })

    it("different paths are different objects", () => {
      const path1 = new Path("users", "0", "comments")
      const path2 = new Path("users", "1", "comments")

      expect(path1).to.not.equal(path2)
    })
  })

  describe("#match", () => {
    it("matches a given path", () => {
      const path1 = new Path("users", "0", "comments")
      const path2 = new Path("users", ".", "comments")

      expect(path1.match(path2)).to.be.true
    })

    it("does not match a given path", () => {
      const path1 = new Path("users", "0", "comments")
      const path2 = new Path("users", ".")

      expect(path1.match(path2)).to.be.false
    })

    it("matches a given wildcard path", () => {
      const path1 = new Path("users", "0", "comments", "1")
      const path2 = new Path("users", ":index", "comments", ":index")

      expect(path1.match(path2)).to.be.true
    })
  })

  describe("#parse", () => {
    it("parses a given path string representation", () => {
      const path = "/users/1/comments"
      const parsed = Path.parse(path)

      expect(parsed.toString()).to.eq(path)
    })
  })

  describe("#resolve", () => {
    it("resolves a path string representation into a Path instance", () => {
      const stringPath = "/users/0/name"
      const path = Path.resolve(stringPath)
      expect(path.toString()).to.eq(stringPath)
    })

    it("resolves a given path into itself", () => {
      const path = Path.parse("/users/0/name")
      const resolved = Path.resolve(path)
      expect(resolved).to.eq(path)
    })
  })

  describe("#traverse", () => {
    it("traverses an object", () => {
      const path = new Path("users", "0", "comments", "1")
      const store = {
        users: [
          { name: "diego", comments: [{ text: "LoL" }, { text: "Nice!" }]},
          { name: "Bianca", comments: []},
        ]
      }

      expect(path.traverse(store)).to.deep.equal({ text: "Nice!" })
    })

    it("traverses an array", () => {
      const path = new Path("0", "name")
      const users = [
        { name: "diego", comments: [{ text: "LoL" }, { text: "Nice!" }]},
        { name: "Bianca", comments: []},
      ]

      expect(path.traverse(users)).to.equal("diego")
    })
  })

  describe("@@iterator", () => {
    it("implements the iterator protocol", () => {
      const nodes = []
      const path = new Path("users", "0", "name")

      for (const node of path) {
        nodes.push(node)
      }

      expect(nodes).to.deep.equal(["users", "0", "name"])
    })

    it("desctructs path into nodes", () => {
      const [head, ...tail] = new Path("users", "0", "name")
      expect(head).to.equal("users")
      expect(tail).to.deep.equal(["0", "name"])
    })
  })

  describe("#subpath", () => {
    it("retrieves subpaths from a given path", () => {
      const path = new Path("users", 0, "name")
      const undefinedPath = path.subpath(-1)
      const depth0Path = path.subpath(0)
      const depth1Path = path.subpath(1)
      const depth2Path = path.subpath(2)
      const depth3Path = path.subpath(3)

      expect(undefinedPath).to.be.undefined
      expect(depth0Path.toString()).to.eq("/")
      expect(depth1Path.toString()).to.eq("/users")
      expect(depth2Path.toString()).to.eq("/users/0")
      expect(depth3Path.toString()).to.eq("/users/0/name")
    })
  })

  describe("#leaf", () => {
    it("retrieves the leaf node of a given path", () => {
      expect(Path.parse("/").leaf).to.eq(undefined)
      expect(Path.parse("/users").leaf).to.eq("users")
      expect(Path.parse("/users/0").leaf).to.eq("0")
      expect(Path.parse("/users/0/name").leaf).to.eq("name")
    })
  })

  describe("#depth", () => {
    it("computes the depth of a given path", () => {
      expect(Path.parse("/").depth).to.eq(0)
      expect(Path.parse("/users").depth).to.eq(1)
      expect(Path.parse("/users/0").depth).to.eq(2)
      expect(Path.parse("/users/0/name").depth).to.eq(3)
    })
  })

  describe("#parent", () => {
    it("computes the parent path of a given path", () => {
      expect(Path.parse("/").parent).to.be.undefined
      expect(Path.parse("/users").parent.toString()).to.eq("/")
      expect(Path.parse("/users/0").parent.toString()).to.eq("/users")
      expect(Path.parse("/users/0/name").parent.toString()).to.eq("/users/0")
    })
  })
})
