import sinon from "sinon"
import { expect } from "chai"

import Arbor, { Node, ArrayNode, ObjectNode } from "../src"

const warmupCache = (tree) => {
  tree.root.users.forEach(user => user.name)
  return tree
}

describe("Arbor", () => {
  it("creates a tree for the given initial state", () => {
    const tree = new Arbor({
      user: { name: "Jon" }
    })

    expect(tree.root).to.deep.eq({
      user: { name: "Jon" }
    })
  })

  it("creates a tree with async initial state", (done) => {
    const subscriber = sinon.spy(() => done())
    const state = { user: { name: "Jon" }}
    const promisedState = new Promise(resolve => resolve(state))
    const tree = new Arbor

    tree.state = promisedState
    tree.subscribe(subscriber)

    expect(subscriber).to.have.been.calledWith({}, {})
    expect(subscriber).to.have.been.calledWith(state, {})
  })

  describe("ObjectNode", () => {
    it("mutates object node", () => {
      const tree = new Arbor({
        user: { name: "Jon" }
      })

      const originalUser = tree.root.user

      tree.root.user = { name: "Snow" }

      expect(originalUser).to.deep.eq({ name: "Jon" })
      expect(tree.root).to.deep.eq({
        user: { name: "Snow" }
      })
    })

    it("mutates object node within a transaction", () => {
      const tree = new Arbor({
        user: { name: "Jon" }
      })

      tree.root.user.$transaction(user => {
        user.name = "Snow"
        user.active = true
      })

      expect(tree.root).to.deep.eq({
        user: { name: "Snow", active: true }
      })
    })

    it("applies structural sharing", () => {
      const tree = new Arbor({
        user: { name: "Jon", posts: [{ title: "Sweet!" }] }
      })

      const originalRoot = tree.root
      const originalUser = tree.root.user
      const originalPosts = tree.root.user.posts

      tree.root.user.name = "Snow"

      expect(originalRoot).to.not.eq(tree.root)
      expect(originalUser).to.not.eq(tree.root.user)
      expect(originalPosts).to.eq(tree.root.user.posts)
    })

    it("unpacks value when assigning proxy", () => {
      const tree = new Arbor({
        user: { name: "Jon", posts: [{ title: "Sweet!" }] }
      })

      expect(tree.root.user.posts[0].$path.toString()).to.eq("/user/posts/0")

      tree.root.post = tree.root.user.posts[0]

      expect(tree.root.post.$path.toString()).to.eq("/post")
    })

    it("destructuring", () => {
      const tree = new Arbor({
        user: { name: "Jon", posts: [{ title: "Sweet!" }] }
      })

      const { name, posts } = tree.root.user

      expect(name).to.eq("Jon")
      expect(posts.constructor).to.eq(ArrayNode)
    })
  })

  describe("ArrayNode", () => {
    it("mutates array node", () => {
      const tree = new Arbor({
        users: [{ name: "Jon" }]
      })

      const originalUsers = tree.root.users

      tree.root.users = [...originalUsers, { name: "Snow" }]

      expect(originalUsers).to.deep.eq([{ name: "Jon" }])
      expect(tree.root).to.deep.eq({
        users: [{ name: "Jon" }, { name: "Snow" }]
      })
    })

    it("mutates all array items", () => {
      const tree = new Arbor({
        users: [
          { active: false },
          { active: false },
        ]
      })

      tree.root.users.forEach(user => {
        user.active = !user.active
      })

      expect(tree.root.users).to.deep.eq([
        { active: true },
        { active: true },
      ])
    })

    it("mutates all array items within a transaction", () => {
      const tree = new Arbor({
        users: [
          { name: "Jon", age: 32 },
          { name: "Bianca", age: 24 },
        ]
      })

      tree.root.users.$transaction(users => {
        users.forEach(user => {
          user.age++
          user.active = true
        })
      })

      expect(tree.root.users).to.deep.eq([
        { name: "Jon", age: 33, active: true },
        { name: "Bianca", age: 25, active: true },
      ])
    })

    it("applies structural sharing", () => {
      const tree = new Arbor({
        user: {
          name: "Jon",
          posts: [
            { title: "Sweet!" },
            { title: "Nice!" },
          ],
        }
      })

      const originalRoot = tree.root
      const originalUser = tree.root.user
      const originalPosts = tree.root.user.posts
      const originalPost0 = tree.root.user.posts[0]
      const originalPost1 = tree.root.user.posts[1]

      tree.root.user.posts.push({ title: "Cool!" })

      expect(originalRoot).to.not.eq(tree.root)
      expect(originalUser).to.not.eq(tree.root.user)
      expect(originalPosts).to.not.eq(tree.root.user.posts)
      expect(originalPost0).to.eq(tree.root.user.posts[0])
      expect(originalPost1).to.eq(tree.root.user.posts[1])
      expect(tree.root.user.posts[2]).to.deep.eq({ title: "Cool!" })
    })

    it("unpacks value when assigning proxy", () => {
      const tree = new Arbor({
        user: { name: "Jon", posts: [{ title: "Sweet!" }] }
      })

      expect(tree.root.user.posts.$path.toString()).to.eq("/user/posts")

      tree.root.posts = tree.root.user.posts

      expect(tree.root.posts.$path.toString()).to.eq("/posts")
    })

    describe("#sort", () => {
      const compareUsers = (user1, user2) => {
        if (user1.name > user2.name) return 1
        if (user1.name < user2.name) return -1
        return 0
      }

      it("does not mutate original data", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        const sorted = tree.root.users.sort(compareUsers)

        expect(sorted).to.not.deep.eq(originalUsers)
        expect(originalUsers).to.deep.eq([
          { name: "Jon" },
          { name: "Snow" },
          { name: "Bianca" },
        ])
      })

      it("sorts the array node", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const sorted = tree.root.users.sort(compareUsers)

        expect(sorted).to.eq(tree.root.users)

        expect(sorted).to.deep.eq([
          { name: "Bianca" },
          { name: "Jon" },
          { name: "Snow" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = warmupCache(new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        }))

        const sorted = tree.root.users.sort(compareUsers)

        expect(sorted.map(user => user.$path.toString())).to.deep.eq([
          "/users/0",
          "/users/1",
          "/users/2",
        ])
      })
    })

    describe("#splice", () => {
      it("does not mutate original data", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        tree.root.users.splice(1, 1, { name: "Alice" }, { name: "Bob" })

        expect(originalUsers).to.deep.eq([
          { name: "Jon" },
          { name: "Snow" },
          { name: "Bianca" },
        ])
      })

      it("splices the array node", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const removed = tree.root.users.splice(1, 1, { name: "Alice" }, { name: "Bob" })

        expect(removed).to.be.an.instanceof(Object)
        expect(removed).to.deep.eq([
          { name: "Snow" },
        ])

        expect(tree.root.users).to.deep.eq([
          { name: "Jon" },
          { name: "Alice" },
          { name: "Bob" },
          { name: "Bianca" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = warmupCache(new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        }))

        const originalBianca = tree.root.users[2]

        tree.root.users.splice(1, 1, { name: "Alice" }, { name: "Bob" })

        expect(originalBianca.$path.toString()).to.eq("/users/2")

        expect(tree.root.users.map(user => user.$path.toString())).to.deep.eq([
          "/users/0",
          "/users/1",
          "/users/2",
          "/users/3",
        ])
      })
    })

    describe("#copyWithin", () => {
      it("does not mutate original data", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        tree.root.users.copyWithin(1, 0, 2)

        expect(originalUsers).to.deep.eq([
          { name: "Jon" },
          { name: "Snow" },
          { name: "Bianca" },
        ])
      })

      it("copies items within the array node", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const users = tree.root.users.copyWithin(1, 0, 2)

        expect(users).to.eq(tree.root.users)
        expect(users).to.deep.eq([
          { name: "Jon" },
          { name: "Jon" },
          { name: "Snow" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = warmupCache(new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
            { name: "Pacheco" },
          ]
        }))

        const users = tree.root.users.copyWithin(1, 0, 3)

        expect(users[0]).to.eq(users[1])
        expect(users.map(user => user.$path.toString())).to.deep.eq([
          "/users/0",
          "/users/0",
          "/users/2",
          "/users/3",
        ])
      })
    })

    describe("#shift", () => {
      it("does not mutate original data", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        tree.root.users.shift()

        expect(originalUsers).to.deep.eq([
          { name: "Jon" },
          { name: "Snow" },
          { name: "Bianca" },
        ])
      })

      it("shifts the first item in the array node", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const user = tree.root.users.shift()

        expect(user.constructor).to.eq(Object)
        expect(user).to.deep.eq({ name: "Jon" })
        expect(tree.root.users).to.deep.eq([
          { name: "Snow" },
          { name: "Bianca" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = warmupCache(new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        }))

        tree.root.users.shift()

        expect(tree.root.users.map(user => user.$path.toString())).to.deep.eq([
          "/users/0",
          "/users/1",
        ])
      })
    })

    describe("#unshift", () => {
      it("does not mutate original data", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        tree.root.users.unshift({ name: "new user" })

        expect(originalUsers).to.deep.eq([
          { name: "Jon" },
          { name: "Snow" },
          { name: "Bianca" },
        ])
      })

      it("unshifts the array node", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const length = tree.root.users.unshift({ name: "new user" })

        expect(length).to.eq(4)
        expect(tree.root.users).to.deep.eq([
          { name: "new user" },
          { name: "Jon" },
          { name: "Snow" },
          { name: "Bianca" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = warmupCache(new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        }))

        tree.root.users.unshift({ name: "new user" })

        expect(tree.root.users.map(user => user.$path.toString())).to.deep.eq([
          "/users/0",
          "/users/1",
          "/users/2",
          "/users/3",
        ])
      })
    })

    describe("#reverse", () => {
      it("does not mutate original data", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        tree.root.users.reverse()

        expect(originalUsers).to.deep.eq([
          { name: "Jon" },
          { name: "Snow" },
          { name: "Bianca" },
        ])
      })

      it("reverses the array node items", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const reversed = tree.root.users.reverse()

        expect(tree.root.users).to.deep.eq([
          { name: "Bianca" },
          { name: "Snow" },
          { name: "Jon" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = warmupCache(new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        }))

        tree.root.users.reverse()

        expect(tree.root.users.map(user => user.$path.toString())).to.deep.eq([
          "/users/0",
          "/users/1",
          "/users/2",
        ])
      })
    })

    describe("#fill", () => {
      it("does not mutate original data", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        tree.root.users.fill({ name: "new user" })

        expect(originalUsers).to.deep.eq([
          { name: "Jon" },
          { name: "Snow" },
          { name: "Bianca" },
        ])
      })

      it("fills the array node with the given item", () => {
        const tree = new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        })

        const filled = tree.root.users.fill({ name: "new user" }, 1, 3)

        expect(filled).to.eq(tree.root.users)
        expect(filled).to.deep.eq([
          { name: "Jon" },
          { name: "new user" },
          { name: "new user" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = warmupCache(new Arbor({
          users: [
            { name: "Jon" },
            { name: "Snow" },
            { name: "Bianca" },
          ]
        }))

        tree.root.users.fill({ name: "new user" }, 1, 3)

        expect(tree.root.users.map(user => user.$path.toString())).to.deep.eq([
          "/users/0",
          "/users/1",
          "/users/1",
        ])
      })
    })

    it("destructuring", () => {
      const tree = new Arbor({
        users: [
          { name: "Jon" },
          { name: "Snow" },
          { name: "Bianca" },
        ]
      })

      const [ head, ...tail ] = tree.root.users

      expect(head.constructor).to.eq(ObjectNode)
      expect(head).to.deep.eq({ name: "Jon" })
      expect(tail.constructor).to.eq(Array)
      expect(tail).to.deep.eq([
        { name: "Snow" },
        { name: "Bianca" },
      ])
    })
  })

  describe("#$transaction", () => {
    it("supports nested (stacked) transactions", () => {
      const tree = new Arbor({
        users: [
          { name: "Jon", posts: [{ stars: 1 }, { stars: 2 }]},
          { name: "Snow", posts: [{ stars: 3 }, { stars: 10 }]},
        ]
      })

      const users = tree.root.users.$transaction(users => {
        users[0].posts.sort((post1, post2) => post2.stars - post1.stars)
        users[1].posts.sort((post1, post2) => post2.stars - post1.stars)
        users[0].name = "stark"
      })

      expect(users).to.eq(tree.root.users)
      expect(users).to.deep.eq([
        { name: "stark", posts: [{ stars: 2 }, { stars: 1 }]},
        { name: "Snow", posts: [{ stars: 10 }, { stars: 3 }]},
      ])
    })

    it("throws an error when mutating node outside the transaction subtree", () => {
      const tree = new Arbor({
        users: [
          { name: "Jon" },
          { name: "Snow" },
        ]
      })

      const invalidTransaction = () => tree.root.users[0].$transaction(user => {
        tree.root.users[1].name = "snow"
      })

      expect(invalidTransaction).to.throw()
    })
  })

  describe("#subscribe", () => {
    it("subscribes to any mutation", () => {
      const subscriber = sinon.spy()
      const tree = new Arbor({
        user: { name: "Jon" }
      })

      tree.subscribe(subscriber)
      tree.root.user.name = "Snow"

      expect(subscriber).to.have.been.calledWith({ user: { name: "Jon" }}, { user: { name: "Jon" }})
      expect(subscriber).to.have.been.calledWith({ user: { name: "Snow" }}, { user: { name: "Jon" }})
    })

    it("subscribes to mutations to a particular path", (done) => {
      const subscriber = sinon.spy(() => done())
      const tree = new Arbor({
        user: { name: "Jon" }
      })

      tree.subscribe("/user/name", subscriber)
      tree.root.user.name = "Snow"

      expect(subscriber).to.have.been.calledWith("Snow", "Jon")
    })

    it("subscribes to mutations to a wildcard path", (done) => {
      const tree = new Arbor({
        users: [{ name: "Bob" }, { name: "Jon" }]
      })

      tree.subscribe("/users/:index/name", (newName, oldName) => {
        expect(oldName).to.eq("Jon")
        expect(newName).to.eq("Snow")
        done()
      })

      tree.root.users[1].name = "Snow"
    })

    it("unsubscribes from mutation notifications", () => {
      const subscriber = sinon.spy()

      const tree = new Arbor({
        users: [{ name: "Bob" }, { name: "Jon" }]
      })

      const unsubscribe = tree.subscribe(subscriber)
      unsubscribe()

      tree.root.users[1].name = "Snow"

      expect(subscriber).to.have.been.calledWith({ users: [{ name: "Bob" }, { name: "Jon" }]}, { users: [{ name: "Bob" }, { name: "Jon" }]})
      expect(subscriber).to.have.not.been.calledWith({ user: { name: "Snow" }}, { user: { name: "Jon" }})
    })
  })
})
