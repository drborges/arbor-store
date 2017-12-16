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
      const value = {
        posts: [
          { title: "nice!" },
          { title: "sweet!" },
          { title: "hell yeah!",
        }
      ]}

      const tree = new Tree(value)
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
      const value = {
        posts: [
          { title: "nice!" },
          { title: "sweet!" },
          { title: "hell yeah!" },
      ]}

      const tree = new Tree(value)

      expect(tree.root.posts[0]).to.deep.eq({ title: "nice!" })
      expect(tree.root.posts[1]).to.deep.eq({ title: "sweet!" })

      tree.root.posts.splice(0, 1)

      expect(tree.root.posts[1]).to.deep.eq({ title: "hell yeah!" })
    })
  })
})
