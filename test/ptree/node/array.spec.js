import sinon from "sinon"
import { expect } from "chai"

import Tree from "../../../src/ptree"

describe("NodeArray", () => {

  describe("#push", () => {
    /*
    * tree -->  [root]
    *             |
    *           [posts]
    *          /      \
    *       [0]        [1]
    *      /              \
    * title = "nice!"    title = "sweet!"
    */
    it("pushes new items into an array node", () => {
      const value = { posts: [{ title: "nice!" }, { title: "sweet!" }]}
      const tree = new Tree(value)
      const root = tree.root
      const posts = tree.root.posts
      const post1 = tree.root.posts[0]
      const post2 = tree.root.posts[1]
      const newPost = { title: "hell yeah!" }

      tree.root.posts.push(newPost)

      expect(posts).to.deep.eq([{ title: "nice!" }, { title: "sweet!" }])
      expect(tree.root).to.not.eq(root)
      expect(tree.root.posts).to.not.eq(posts)
      expect(tree.root.posts[0]).to.eq(post1)
      expect(tree.root.posts[1]).to.eq(post2)
      expect(tree.root.posts[2]).to.not.eq(newPost)
      expect(tree.root.posts[2]).to.deep.eq(newPost)
    })
  })

  describe("#map", () => {
    /*
    * tree -->  [root]
    *             |
    *           [posts]
    *          /      \
    *       [0]        [1]
    *      /              \
    * title = "nice!"    title = "sweet!"
    */
    it("maps over an array node", () => {
      const value = { posts: [{ title: "nice!" }, { title: "sweet!" }]}
      const tree = new Tree(value)

      const titles = tree.root.posts.map(post => post.title)

      expect(titles).to.deep.eq([
        "nice!",
        "sweet!",
      ])
    })

    /*
    * tree -->  [root]
    *             |
    *           [posts]
    *          /      \
    *       [0]        [1]
    *      /              \
    * title = "nice!"    title = "sweet!"
    */
    it("is compatible with actual Array#map", () => {
      const value = { posts: [{ title: "nice!" }, { title: "sweet!" }]}
      const tree = new Tree(value)

      const mapped = tree.root.posts.map((post, i, posts) => [post, i, posts])

      expect(mapped).to.deep.eq([
        [{ title: "nice!" }, 0, [{ title: "nice!" }, { title: "sweet!" }]],
        [{ title: "sweet!" }, 1, [{ title: "nice!" }, { title: "sweet!" }]],
      ])
    })

    /*
    * tree -->  [root]
    *             |
    *           [posts]
    *          /      \
    *       [0]        [1]
    *      /              \
    * title = "nice!"    title = "sweet!"
    */
    it("mapped nodes are still proxies in the tree", () => {
      const value = { posts: [{ title: "nice!" }, { title: "sweet!" }]}
      const tree = new Tree(value)
      const root = tree.root
      const posts = tree.root.posts
      const post1 = tree.root.posts[0]
      const post2 = tree.root.posts[1]

      const mappedPosts = tree.root.posts.map(post => post)

      posts[0].title = "new title"

      expect(post1.title).to.eq("nice!")
      expect(tree.root.posts[0].title).to.eq("new title")
      expect(tree.root).to.not.eq(root)
      expect(tree.root.posts).to.not.eq(posts)
      expect(tree.root.posts[0]).to.not.eq(post1)
      expect(tree.root.posts[1]).to.eq(post2)
    })
  })

  describe("#splice", () => {
    it("removes and adds elements to the tree", () => {
      const tree = new Tree({
        posts: [
          { title: "nice!" },
          { title: "sweet!" },
          { title: "hell yeah!" }
        ]
      })

      const root = tree.root
      const posts = tree.root.posts

      const removed = tree.root.posts.splice(0, 2, { title: "Oh boy!" })

      expect(posts).to.deep.eq([
        { title: "nice!" },
        { title: "sweet!" },
        { title: "hell yeah!" },
      ])

      expect(removed).to.deep.eq([
        { title: "nice!" },
        { title: "sweet!" },
      ])

      expect(tree.root.posts).to.deep.eq([
        { title: "Oh boy!" },
        { title: "hell yeah!" },
      ])

      expect(tree.root).to.not.eq(root)
    })

    it("deletes all children proxies from parent's cache that were affected by the splice", () => {
      const tree = new Tree({
        posts: [
          { title: "nice!" },
          { title: "sweet!" },
          { title: "hell yeah!" }
        ]
      })

      expect(tree.root.posts[0]).to.deep.eq({ title: "nice!" })
      expect(tree.root.posts[1]).to.deep.eq({ title: "sweet!" })

      tree.root.posts.splice(0, 1)

      expect(tree.root.posts[1]).to.deep.eq({ title: "hell yeah!" })
    })

    it("wraps elements within arbor proxies", () => {
      const tree = new Tree({
        posts: [
          { title: "nice!" },
          { title: "sweet!" },
          { title: "hell yeah!" }
        ]
      })

      const removed = tree.root.posts.splice(0, 2, { title: "Oh boy!" })

      expect(removed.every(user => user.constructor.name !== "NodeObject")).to.eq(true)
    })
  })

  describe("#sort", () => {
    it("sorts NodeArray leaving children that did not change positions alone", () => {
      const tree = new Tree({
        users: [
          { age: 21 },
          { age: 35 },
          { age: 30 },
          { age: 40 },
        ]
      })

      const users = tree.root.users
      const user0 = users[0]
      const user1 = users[1]
      const user2 = users[2]
      const user3 = users[3]

      const sorted = tree.root.users.sort((user1, user2) => user1.age - user2.age)

      expect(sorted).to.eq(tree.root.users)
      expect(sorted).to.not.eq(users)
      expect(sorted).to.deep.eq([
        { age: 21 },
        { age: 30 },
        { age: 35 },
        { age: 40 },
      ])

      expect(user0).to.eq(sorted[0])
      expect(user1).to.not.eq(sorted[1])
      expect(user2).to.not.eq(sorted[2])
      expect(user3).to.eq(sorted[3])
    })

    it("wraps elements within arbor proxies", () => {
      const tree = new Tree({
        users: [
          { age: 21 },
          { age: 35 },
          { age: 30 },
          { age: 40 },
        ]
      })

      const sorted = tree.root.users.sort((user1, user2) => user1.age - user2.age)

      expect(sorted.constructor.name).to.eq("NodeArray")
      expect(sorted.every(user => user.constructor.name === "NodeObject")).to.eq(true)
    })

    it("keeps NodeArray#$value sorted as well", () => {
      const tree = new Tree({
        users: [
          { age: 21 },
          { age: 35 },
          { age: 30 },
          { age: 40 },
        ]
      })

      const users = tree.root.users

      const sorted = tree.root.users.sort((user1, user2) => user1.age - user2.age)

      expect(sorted.$value).to.deep.eq([
        { age: 21 },
        { age: 30 },
        { age: 35 },
        { age: 40 },
      ])
    })

    it("does not mutate original NodeArray", () => {
      const tree = new Tree({
        users: [
          { age: 21 },
          { age: 35 },
          { age: 30 },
          { age: 40 },
        ]
      })

      const users = tree.root.users

      tree.root.users.sort((user1, user2) => user1.age - user2.age)

      expect(users).to.deep.eq([
        { age: 21 },
        { age: 35 },
        { age: 30 },
        { age: 40 },
      ])
    })

    it("keep nodes' $paths up-to-date", () => {
      const tree = new Tree({
        users: [
          { age: 21 },
          { age: 35, posts: [{ text: "Nice" }] },
          { age: 30, posts: [{ text: "Nice" }] },
          { age: 40 },
        ]
      })

      const user1Posts = tree.root.users[1].posts
      const user2Posts = tree.root.users[2].posts

      const sorted = tree.root.users.sort((user1, user2) => user1.age - user2.age)

      expect(user1Posts.$path.toString()).to.eq("/users/1/posts")
      expect(user2Posts.$path.toString()).to.eq("/users/2/posts")

      expect(sorted[0].$path.toString()).to.eq("/users/0")
      expect(sorted[1].$path.toString()).to.eq("/users/1")
      expect(sorted[1].posts.$path.toString()).to.eq("/users/1/posts")
      expect(sorted[2].$path.toString()).to.eq("/users/2")
      expect(sorted[2].posts.$path.toString()).to.eq("/users/2/posts")
      expect(sorted[3].$path.toString()).to.eq("/users/3")
    })
  })

  describe("#copyWithin", () => {
    it("copies NodeArray items within the NodeArray itself", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
          { name: "drborges" },
        ]
      })

      expect(tree.root.users.copyWithin(1, 0, 2)).to.deep.eq([
        { name: "Diego" },
        { name: "Diego" },
        { name: "Rocha" },
        { name: "drborges" },
      ])
    })

    it("wraps elements within arbor proxies", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
          { name: "drborges" },
        ]
      })

      const copied = tree.root.users.copyWithin(1, 0, 2)

      expect(copied.constructor.name).to.eq("NodeArray")
      expect(copied.every(user => user.constructor.name === "NodeObject")).to.eq(true)
    })

    it("does not mutate original NodeArray", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
          { name: "drborges" },
        ]
      })

      const originalUsers = tree.root.users

      tree.root.users.copyWithin(1, 0, 2)

      expect(originalUsers).to.deep.eq([
        { name: "Diego" },
        { name: "Rocha" },
        { name: "Borges" },
        { name: "drborges" },
      ])
    })

    it("reuses items not affected by the mutation", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
          { name: "drborges" },
        ]
      })

      const diego = tree.root.users[0]
      const rocha = tree.root.users[1]
      const borges = tree.root.users[2]
      const drborges = tree.root.users[3]

      tree.root.users.copyWithin(1, 0, 2)

      expect(tree.root.users[0]).to.eq(diego)
      expect(tree.root.users[1]).to.not.eq(rocha)
      expect(tree.root.users[2]).to.not.eq(borges)
      expect(tree.root.users[3]).to.eq(drborges)
    })
  })

  describe("#reverse", () => {
    it("reverses the sequence of items in a NodeArray", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
        ]
      })

      const reversed = tree.root.users.reverse()

      expect(reversed).to.deep.eq([
        { name: "Borges" },
        { name: "Rocha" },
        { name: "Diego" },
      ])
    })

    it("wraps reversed elements within arbor proxies", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
        ]
      })

      const reversed = tree.root.users.reverse()

      expect(reversed.constructor.name).to.eq("NodeArray")
      expect(reversed.every(user => user.constructor.name === "NodeObject")).to.eq(true)
    })

    it("does not mutate original NodeArray", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
        ]
      })

      const originalUsers = tree.root.users

      tree.root.users.reverse()

      expect(originalUsers).to.deep.eq([
        { name: "Diego" },
        { name: "Rocha" },
        { name: "Borges" },
      ])

      expect(originalUsers.$value).to.deep.eq([
        { name: "Diego" },
        { name: "Rocha" },
        { name: "Borges" },
      ])
    })

    it("reuses items not affected by the mutation", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
        ]
      })

      const diego = tree.root.users[0]
      const rocha = tree.root.users[1]
      const borges = tree.root.users[2]

      tree.root.users.reverse()

      expect(tree.root.users[0]).to.not.eq(diego)
      expect(tree.root.users[1]).to.eq(rocha)
      expect(tree.root.users[2]).to.not.eq(borges)
    })
  })

  describe("#shift", () => {
    it("shifts the items in a NodeArray", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
        ]
      })

      const shifted = tree.root.users.shift()

      expect(shifted).to.deep.eq({ name: "Diego" })
      expect(tree.root.users).to.deep.eq([
        { name: "Rocha" },
        { name: "Borges" },
      ])
    })

    it("shifted elements are no longer arbor proxies", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
        ]
      })

      const shifted = tree.root.users.shift()

      expect(shifted.constructor.name).to.not.eq("NodeObject")
    })

    it("does not mutate original NodeArray", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
        ]
      })

      const originalUsers = tree.root.users

      tree.root.users.shift()

      expect(originalUsers).to.deep.eq([
        { name: "Diego" },
        { name: "Rocha" },
        { name: "Borges" },
      ])

      expect(originalUsers.$value).to.deep.eq([
        { name: "Diego" },
        { name: "Rocha" },
        { name: "Borges" },
      ])
    })

    it("keep nodes' $paths up-to-date", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
        ]
      })

      const first = tree.root.users[0]
      const second = tree.root.users[1]
      const thirt = tree.root.users[2]

      tree.root.users.shift()

      expect(first.$path.toString()).to.eq("/users/0")
      expect(second.$path.toString()).to.eq("/users/1")
      expect(thirt.$path.toString()).to.eq("/users/2")

      expect(tree.root.users[0].$path.toString()).to.eq("/users/0")
      expect(tree.root.users[1].$path.toString()).to.eq("/users/1")
    })
  })

  describe("#unshift", () => {
    it("unshifts the items in a NodeArray appending new ones to the sequence", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
        ]
      })

      const newLength = tree.root.users.unshift(
        { name: "Bianca" },
        { name: "Pacheco" },
      )

      expect(newLength).to.eq(5)
      expect(tree.root.users).to.deep.eq([
        { name: "Bianca" },
        { name: "Pacheco" },
        { name: "Diego" },
        { name: "Rocha" },
        { name: "Borges" },
      ])
    })

    it("wraps new elements within arbor proxies", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
        ]
      })

      tree.root.users.unshift(
        { name: "Bianca" },
        { name: "Pacheco" },
      )

      expect(tree.root.users.every(user => user.constructor.name === "NodeObject")).to.eq(true)
    })

    it("does not mutate original NodeArray", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
        ]
      })

      const originalUsers = tree.root.users

      tree.root.users.unshift(
        { name: "Bianca" },
        { name: "Pacheco" },
      )

      expect(originalUsers).to.deep.eq([
        { name: "Diego" },
        { name: "Rocha" },
        { name: "Borges" },
      ])

      expect(originalUsers.$value).to.deep.eq([
        { name: "Diego" },
        { name: "Rocha" },
        { name: "Borges" },
      ])
    })

    it("keep nodes' $paths up-to-date", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" },
          { name: "Rocha" },
          { name: "Borges" },
        ]
      })

      const first = tree.root.users[0]
      const second = tree.root.users[1]
      const thirt = tree.root.users[2]

      tree.root.users.unshift(
        { name: "Bianca" },
        { name: "Pacheco" },
      )

      expect(first.$path.toString()).to.eq("/users/0")
      expect(second.$path.toString()).to.eq("/users/1")
      expect(thirt.$path.toString()).to.eq("/users/2")

      expect(tree.root.users[0].$path.toString()).to.eq("/users/0")
      expect(tree.root.users[1].$path.toString()).to.eq("/users/1")
      expect(tree.root.users[2].$path.toString()).to.eq("/users/2")
      expect(tree.root.users[3].$path.toString()).to.eq("/users/3")
      expect(tree.root.users[4].$path.toString()).to.eq("/users/4")
    })
  })
})
