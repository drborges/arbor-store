import sinon from "sinon"
import { expect } from "chai"

import Arbor, { Node } from "../src/arbor"

describe.only("Arbor", () => {
  it("creates a tree for the given initial state", () => {
    const tree = new Arbor({
      user: { name: "Diego" }
    })

    expect(tree.root).to.deep.eq({
      user: { name: "Diego" }
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

      tree.root.user.transaction(user => {
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

      tree.root.users.transaction(users => {
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
})
