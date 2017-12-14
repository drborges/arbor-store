import sinon from "sinon"
import { expect } from "chai"

import { Path } from "../../src/ptree"
import Tree, { Node } from "../../src/ptree"

describe("Tree", () => {
  describe("#get", () => {
    /*
     * tree --> [root]
     *            |
     *           name = "Diego"
     */
    it("cannot access unexisting props", () => {
      const tree = new Tree({ name: "Diego" })

      expect(tree.root.age).to.be.undefined
    })

    /*
     * tree --> [root]
     *            |
     *           name = "Diego"
     */
    it("creates a tree node of hight 1", () => {
      const value = { name: "Diego" }
      const tree = new Tree(value)

      expect(tree.root).to.not.eq(value)
      expect(tree.root).to.deep.eq(value)
      expect(tree.root.name).to.eq(value.name)
    })

    /*
     * tree --> [root]
     *            |
     *          [user]
     *            |
     *           name = "Diego"
     */
    it("creates a tree node of hight 2", () => {
      const value = { user: { name: "Diego" } }
      const tree = new Tree(value)

      expect(tree.root).to.not.eq(value)
      expect(tree.root).to.deep.eq(value)
      expect(tree.root.user).to.not.eq(value.user)
      expect(tree.root.user).to.deep.eq(value.user)
      expect(tree.root.user.name).to.eq(value.user.name)
    })

    /*
     * tree -->  [root]
     *          /     \
     *   [user1]      [user2]
     *     |               \
     * name = "Diego"     name = "Borges"
     */
    it("creates references to children proxies when the corresponding paths are accessed", () => {
      const tree = new Tree({
        user1: { name: "Diego" },
        user2: { name: "Borges" },
      })

      expect(tree.root.$children).to.deep.eq({})
      expect(tree.root.user1.name).to.eq("Diego")
      expect(tree.root.user2.name).to.eq("Borges")
      expect(tree.root.$children).to.deep.eq({
        "user1": tree.root.user1,
        "user2": tree.root.user2,
      })
    })

    /*
     * tree -->  [root]
     *          /     \
     *   [user1]      [user2]
     *     |               \
     * name = "Diego"     name = "Borges"
     */
    it("caches children proxies", () => {
      const tree = new Tree({
        user1: { name: "Diego" },
        user2: { name: "Borges" },
      })

      const user1 = tree.root.user1
      expect(tree.root.user1).to.eq(user1)
    })

    it("creates a tree node of hight 2 with an array proxy", () => {
      const value = { users: [{ name: "Diego" }] }
      const tree = new Tree(value)

      expect(tree.root).to.not.eq(value)
      expect(tree.root).to.deep.eq(value)
      expect(tree.root.users).to.be.an.array
      expect(tree.root.users).to.not.eq(value.users)
      expect(tree.root.users).to.deep.eq(value.users)
      expect(tree.root.users[0]).to.not.eq(value.users[0])
      expect(tree.root.users[0]).to.deep.eq(value.users[0])
      expect(tree.root.users[0].name).to.eq(value.users[0].name)
    })
  })

  describe("#set", () => {
    /*
     * tree -->  [root]
     *             |
     *            name = "Diego"
     */
    it("updates the tree with a new root representing the new state", () => {
      const value = { name: "Diego" }
      const tree = new Tree(value)
      const node = tree.root

      node.name = "Borges"

      expect(node.name).to.eq("Diego")
      expect(tree.root).to.not.eq(node)
      expect(tree.root.name).to.eq("Borges")
      expect(tree.get("/name")).to.eq(tree.root.name)
    })

    /**
     * ### Initial State Tree
     *
     * tree -->  [root]
     *             |
     *           [user]
     *          /      \
     * name = "Diego"  [posts]
     *                    |
     *                   [0]
     *                    |
     *                   title = "Sweet!"
     *
     * ### Mutation Path:
     *
     * Mutation Paths represent the mutation to be applied to a given State Tree.
     * Mutations are not destructive and the input State Tree is always preserved.
     * A new State Tree is generated as a function of the initial State Tree + the
     * Mutation Path, e.g:
     *
     * type MutationPath = (Path, value)
     * type mutator = (State, Mutation): State
     *
     *           [root]
     *             |
     *           [user]
     *          /
     * name = "Borges"
     *
     *
     * Resulting State Tree
     *
     * The resulting tree is a completely new tree,
     *
     * tree -->  [root]
     *             |
     *           [user]
     *          /      \
     * name = "Borges"  [posts]
     *                    |
     *                   [0]
     *                    |
     *                   title = "Sweet!"
     */
    it("reuses subtree references that were not affected by the mutation", () => {
      const value = { user: { name: "Diego", posts: [{ title: "Sweet!" }] } }
      const tree = new Tree(value)
      const root = tree.root
      const userPosts = root.user.posts

      tree.root.user.name = "Borges"

      expect(tree.root.user.name).to.eq("Borges")
      expect(tree.root.user.posts).to.eq(userPosts)
      expect(tree.root.user.posts).to.deep.eq([{ title: "Sweet!" }])
      expect(root).to.deep.eq({
        user: { name: "Diego", posts: [{ title: "Sweet!" }] }
      })
    })

   /*
    * tree -->  [root]
    *             |
    *           [user]
    *          /      \
    * name = "Diego"  [posts]
    *                    |
    *                   [0]
    *                    |
    *                   title = "Sweet!"
    */
   it("mutates a non-leaf node", () => {
     const value = { user: { name: "Diego", posts: [{ title: "Sweet!" }] } }
     const tree = new Tree(value)
     const root = tree.root
     const user = tree.root.user

     tree.root.user = { name: "Borges", posts: [] }

     expect(root).to.deep.eq({ user: { name: "Diego", posts: [{ title: "Sweet!" }] }})
     expect(tree.root).to.not.eq(root)
     expect(tree.root.user).to.not.eq(user)
     expect(tree.root.user.name).to.eq("Borges")
     expect(tree.root.user.posts).to.be.empty
   })

   /*
    * tree -->  [root]
    *             |
    *           [user]
    *          /      \
    * name = "Diego"  [posts]
    *                    |
    *                   [0]
    *                    |
    *                   title = "Sweet!"
    */
   it("mutates proxy $value besides its $children proxies", () => {
     const tree = new Tree({ user: { name: "Diego", posts: [{ title: "Sweet!" }]}})
     const root = tree.root

     tree.root.user.name = "Borges"

     expect(root.$value).to.deep.eq({ user: { name: "Diego", posts: [{ title: "Sweet!" }]}})
     expect(tree.root.$value).to.deep.eq({ user: { name: "Borges", posts: [{ title: "Sweet!" }]}})
   })
  })

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

  describe("#subscribe", () => {
    it("subscribes to mutations to the root of the tree", (done) => {
      const tree = new Tree({
        posts: [
          { title: "nice!" },
          { title: "sweet!" },
          { title: "hell yeah!" },
        ]
      })

      tree.subscribe("/", (newState) => {
        expect(newState).to.deep.eq({
          posts: [
            { title: "nice!" },
            { title: "sweet!" },
          ]
        })

        done()
      })

      tree.root.posts.splice(2, 1)
    })

    it("unsubscribes from mutations to the tree", () => {
      const subscriber = sinon.spy()
      const tree = new Tree({
        posts: [
          { title: "nice!" },
          { title: "sweet!" },
          { title: "hell yeah!" },
        ]
      })

      const unsubscribe = tree.subscribe("/", subscriber)
      unsubscribe()

      tree.root.posts.splice(2, 1)

      expect(subscriber).to.have.not.been.called
    })
  })
})
