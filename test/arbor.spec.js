import sinon from "sinon"
import { expect } from "chai"

import Arbor, { Node } from "../src/arbor"

const warmupCache = (tree) => {
  tree.root.users.forEach(user => user.name)
}

describe.only("Arbor", () => {
  it("creates a tree for the given initial state", () => {
    const tree = new Arbor({
      user: { name: "Diego" }
    })

    expect(tree.root).to.deep.eq({
      user: { name: "Diego" }
    })
  })

  describe("Node", () => {
    it("is an abstract class and cannot be directly constructed", () => {
      expect(() => new Node()).to.throw()
    })
  })

  describe("ObjectNode", () => {
    it("mutates object node", () => {
      const tree = new Arbor({
        user: { name: "Diego" }
      })

      const originalUser = tree.root.user

      tree.root.user = { name: "Borges" }

      expect(originalUser).to.deep.eq({ name: "Diego" })
      expect(tree.root).to.deep.eq({
        user: { name: "Borges" }
      })
    })

    it("mutates object node within a transaction", () => {
      const tree = new Arbor({
        user: { name: "Diego" }
      })

      tree.root.user.$transaction(user => {
        user.name = "Borges"
        user.active = true
      })

      expect(tree.root).to.deep.eq({
        user: { name: "Borges", active: true }
      })
    })

    it("applies structural sharing", () => {
      const tree = new Arbor({
        user: { name: "Diego", posts: [{ title: "Sweet!" }] }
      })

      const originalRoot = tree.root
      const originalUser = tree.root.user
      const originalPosts = tree.root.user.posts

      tree.root.user.name = "Borges"

      expect(originalRoot).to.not.eq(tree.root)
      expect(originalUser).to.not.eq(tree.root.user)
      expect(originalPosts).to.eq(tree.root.user.posts)
    })

    it("unpacks value when assigning proxy", () => {
      const tree = new Arbor({
        user: { name: "Diego", posts: [{ title: "Sweet!" }] }
      })

      expect(tree.root.user.posts[0].$path.toString()).to.eq("/user/posts/0")

      tree.root.post = tree.root.user.posts[0]

      expect(tree.root.post.$path.toString()).to.eq("/post")
    })
  })

  describe("ArrayNode", () => {
    it("mutates array node", () => {
      const tree = new Arbor({
        users: [{ name: "Diego" }]
      })

      const originalUsers = tree.root.users

      tree.root.users = [...originalUsers, { name: "Borges" }]

      expect(originalUsers).to.deep.eq([{ name: "Diego" }])
      expect(tree.root).to.deep.eq({
        users: [{ name: "Diego" }, { name: "Borges" }]
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
          { name: "Diego", age: 32 },
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
        { name: "Diego", age: 33, active: true },
        { name: "Bianca", age: 25, active: true },
      ])
    })

    it("applies structural sharing", () => {
      const tree = new Arbor({
        user: {
          name: "Diego",
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
        user: { name: "Diego", posts: [{ title: "Sweet!" }] }
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
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        const sorted = tree.root.users.sort(compareUsers)

        expect(sorted).to.not.deep.eq(originalUsers)
        expect(originalUsers).to.deep.eq([
          { name: "Diego" },
          { name: "Borges" },
          { name: "Bianca" },
        ])
      })

      it("sorts the array node", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const sorted = tree.root.users.sort(compareUsers)

        expect(sorted).to.eq(tree.root.users)

        expect(sorted).to.deep.eq([
          { name: "Bianca" },
          { name: "Borges" },
          { name: "Diego" },
        ])

        expect(tree.root.users).to.deep.eq([
          { name: "Bianca" },
          { name: "Borges" },
          { name: "Diego" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        warmupCache(tree)

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
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        tree.root.users.splice(1, 1, { name: "Alice" }, { name: "Bob" })

        expect(originalUsers).to.deep.eq([
          { name: "Diego" },
          { name: "Borges" },
          { name: "Bianca" },
        ])
      })

      it("splices the array node", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const removed = tree.root.users.splice(1, 1, { name: "Alice" }, { name: "Bob" })

        expect(removed).to.be.an.instanceof(Object)
        expect(removed).to.deep.eq([
          { name: "Borges" },
        ])

        expect(tree.root.users).to.deep.eq([
          { name: "Diego" },
          { name: "Alice" },
          { name: "Bob" },
          { name: "Bianca" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        warmupCache(tree)

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
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        tree.root.users.copyWithin(1, 0, 2)

        expect(originalUsers).to.deep.eq([
          { name: "Diego" },
          { name: "Borges" },
          { name: "Bianca" },
        ])
      })

      it("copies items within the array node", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const users = tree.root.users.copyWithin(1, 0, 2)

        expect(users).to.eq(tree.root.users)
        expect(users).to.deep.eq([
          { name: "Diego" },
          { name: "Diego" },
          { name: "Borges" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
            { name: "Pacheco" },
          ]
        })

        warmupCache(tree)

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
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        tree.root.users.shift()

        expect(originalUsers).to.deep.eq([
          { name: "Diego" },
          { name: "Borges" },
          { name: "Bianca" },
        ])
      })

      it("shifts the first item in the array node", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const user = tree.root.users.shift()

        expect(user.constructor).to.eq(Object)
        expect(user).to.deep.eq({ name: "Diego" })
        expect(tree.root.users).to.deep.eq([
          { name: "Borges" },
          { name: "Bianca" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        warmupCache(tree)

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
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        tree.root.users.unshift({ name: "new user" })

        expect(originalUsers).to.deep.eq([
          { name: "Diego" },
          { name: "Borges" },
          { name: "Bianca" },
        ])
      })

      it("unshifts the array node", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const length = tree.root.users.unshift({ name: "new user" })

        expect(length).to.eq(4)
        expect(tree.root.users).to.deep.eq([
          { name: "new user" },
          { name: "Diego" },
          { name: "Borges" },
          { name: "Bianca" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        warmupCache(tree)

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
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        tree.root.users.reverse()

        expect(originalUsers).to.deep.eq([
          { name: "Diego" },
          { name: "Borges" },
          { name: "Bianca" },
        ])
      })

      it("reverses the array node items", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const reversed = tree.root.users.reverse()

        expect(tree.root.users).to.deep.eq([
          { name: "Bianca" },
          { name: "Borges" },
          { name: "Diego" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        warmupCache(tree)

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
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const originalUsers = tree.root.users

        tree.root.users.fill({ name: "new user" })

        expect(originalUsers).to.deep.eq([
          { name: "Diego" },
          { name: "Borges" },
          { name: "Bianca" },
        ])
      })

      it("fills the array node with the given item", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        const filled = tree.root.users.fill({ name: "new user" }, 1, 3)

        expect(filled).to.eq(tree.root.users)
        expect(filled).to.deep.eq([
          { name: "Diego" },
          { name: "new user" },
          { name: "new user" },
        ])
      })

      it("keeps array items' path in sync", () => {
        const tree = new Arbor({
          users: [
            { name: "Diego" },
            { name: "Borges" },
            { name: "Bianca" },
          ]
        })

        warmupCache(tree)

        tree.root.users.fill({ name: "new user" }, 1, 3)

        expect(tree.root.users.map(user => user.$path.toString())).to.deep.eq([
          "/users/0",
          "/users/1",
          "/users/1",
        ])
      })
    })
  })

  describe("Model", () => {
    it("wraps nodes within custom model classes", () => {
      class User {
        title = "Mr."

        get formalName() {
          return `${this.title} ${this.name}`
        }
      }

      const tree = new Arbor({
        users: [
          {
            name: "Diego",
            age: 32,
          },
        ]
      })

      tree.bind(User).to("/users/:index")

      expect(tree.root.users[0].formalName).to.eq("Mr. Diego")
    })

    it("triggers mutations from within custom model class", () => {
      class Post {
        updateTitle = (title) => {
          this.title = title
        }
      }

      const tree = new Arbor({
        users: [
          {
            name: "Diego",
            age: 32,
            posts: [
              { title: "Sweet!" },
            ]
          },
        ]
      })

      tree.bind(Post).to("/users/:index/posts/:index")
      tree.root.users[0].posts[0].updateTitle("Nice!")

      expect(tree.root.users[0].posts[0].title).to.eq("Nice!")
    })

    it("auto binds target's methods", () => {
      class Users {}

      const tree = new Arbor({
        users: [
          { name: "Diego" },
          { name: "Bianca" },
        ]
      })

      tree.bind(Users).to("/users")
      const reverse = tree.root.users.reverse

      const reversed = reverse()

      expect(reversed).to.deep.eq([
        { name: "Bianca" },
        { name: "Diego" },
      ])
    })

    it("auto binds model's methods", () => {
      class Users {
        sortByName() {
          return this.sort((user1, user2) => {
            if (user1.name > user2.name) return 1
            if (user1.name < user2.name) return -1
            return 0
          })
        }
      }

      const tree = new Arbor({
        users: [
          { name: "Diego" },
          { name: "Bianca" },
        ]
      })

      tree.bind(Users).to("/users")
      const sortByName = tree.root.users.sortByName

      const sorted = sortByName()

      expect(sorted).to.deep.eq([
        { name: "Bianca" },
        { name: "Diego" },
      ])
    })

    it("unpacks object value when assigning proxy", () => {
      class Post {}

      const tree = new Arbor({
        user: { name: "Diego", posts: [{ title: "Sweet!" }] }
      })

      tree.bind(Post).to("/users/:index/posts/:index")

      expect(tree.root.user.posts.$path.toString()).to.eq("/user/posts")

      tree.root.post = tree.root.user.posts[0]

      expect(tree.root.post.$path.toString()).to.eq("/post")
    })

    it("unpacks array value when assigning proxy", () => {
      class Posts {}

      const tree = new Arbor({
        user: { name: "Diego", posts: [{ title: "Sweet!" }] }
      })

      tree.bind(Posts).to("/users/:index/posts")

      expect(tree.root.user.posts.$path.toString()).to.eq("/user/posts")

      tree.root.posts = tree.root.user.posts

      expect(tree.root.posts.$path.toString()).to.eq("/posts")
    })
  })

  describe("#$transaction", () => {
    it("supports nested (stacked) transactions", () => {
      const tree = new Arbor({
        users: [
          { name: "Diego", posts: [{ stars: 1 }, { stars: 2 }]},
          { name: "Borges", posts: [{ stars: 3 }, { stars: 10 }]},
        ]
      })

      const users = tree.root.users.$transaction(users => {
        users[0].posts.sort((post1, post2) => post2.stars - post1.stars)
        users[1].posts.sort((post1, post2) => post2.stars - post1.stars)
        users[0].name = "drborges"
      })

      expect(users).to.eq(tree.root.users)
      expect(users).to.deep.eq([
        { name: "drborges", posts: [{ stars: 2 }, { stars: 1 }]},
        { name: "Borges", posts: [{ stars: 10 }, { stars: 3 }]},
      ])
    })

    it("throws an error when mutating node outside the transaction subtree", () => {
      const tree = new Arbor({
        users: [
          { name: "Diego" },
          { name: "Borges" },
        ]
      })

      const invalidTransaction = () => tree.root.users[0].$transaction(user => {
        tree.root.users[1].name = "borges"
      })

      expect(invalidTransaction).to.throw()
    })
  })

  describe("#subscribe", () => {
    it("subscribes to any mutation", () => {
      const tree = new Arbor({
        user: { name: "Diego" }
      })

      tree.subscribe((newState, oldState) => {
        expect(oldState).to.deep.eq({
          user: { name: "Diego" }
        })

        expect(newState).to.deep.eq({
          user: { name: "Borges" }
        })
      })

      tree.root.user.name = "Borges"
    })

    it("subscribes to mutations to a particular path", (done) => {
      const tree = new Arbor({
        user: { name: "Diego" }
      })

      tree.subscribe("/user/name", (newName, oldName) => {
        expect(oldName).to.eq("Diego")
        expect(newName).to.eq("Borges")
        done()
      })

      tree.root.user.name = "Borges"
    })

    it("subscribes to mutations to a wildcard path", (done) => {
      const tree = new Arbor({
        users: [{ name: "Bob" }, { name: "Diego" }]
      })

      tree.subscribe("/users/:index/name", (newName, oldName) => {
        expect(oldName).to.eq("Diego")
        expect(newName).to.eq("Borges")
        done()
      })

      tree.root.users[1].name = "Borges"
    })

    it("unsubscribes from mutation notifications", () => {
      const subscriber = sinon.spy()

      const tree = new Arbor({
        users: [{ name: "Bob" }, { name: "Diego" }]
      })

      const unsubscribe = tree.subscribe(subscriber)
      unsubscribe()

      tree.root.users[1].name = "Borges"

      expect(subscriber).to.not.have.been.called
    })
  })
})
