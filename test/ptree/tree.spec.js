import sinon from "sinon"
import { expect } from "chai"

import { Path } from "../../src/ptree"
import Tree, { Node, Model } from "../../src/ptree"

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

  describe("#register", () => {
    it("registers a custom node handler to a given path", () => {

      @Model
      class User {}

      const tree = new Tree({
        user: {
          firstName: "Diego",
        }
      })

      tree.register("/user", User)

      expect(tree.root.user.constructor).to.eq(User)
      expect(tree.root.user.firstName).to.eq("Diego")
    })

    it("registers a custom node handler to a path with wildcard", () => {

      @Model
      class Post {}

      const tree = new Tree({
        user: {
          posts: [
            { title: "Nice!" },
            { title: "Sweet!" },
            { title: "Super!" },
          ],
        }
      })

      tree.register("/user/posts/:index", Post)

      expect(tree.root.user.posts[0].constructor).to.eq(Post)
      expect(tree.root.user.posts[1].constructor).to.eq(Post)
      expect(tree.root.user.posts[2].constructor).to.eq(Post)
      expect(tree.root.user.posts[0]).to.deep.eq({ title: "Nice!" })
      expect(tree.root.user.posts[1]).to.deep.eq({ title: "Sweet!" })
      expect(tree.root.user.posts[2]).to.deep.eq({ title: "Super!" })
    })

    it("allows custom API to perform mutations on the state tree", () => {

      @Model
      class User {
        deletePost(index) {
          this.posts.splice(index, 1)
        }
      }

      const tree = new Tree({
        user: {
          posts: [
            { title: "Nice!" },
            { title: "Sweet!" },
            { title: "Super!" },
          ],
        }
      })

      tree.register("/user", User)

      const user = tree.root.user
      user.deletePost(1)

      expect(user.posts).to.deep.eq([
        { title: "Nice!" },
        { title: "Sweet!" },
        { title: "Super!" },
      ])

      expect(tree.root.user.posts).to.deep.eq([
        { title: "Nice!" },
        { title: "Super!" },
      ])
    })

    it("bounds methods and getters to the proxied tree node", () => {

      @Model
      class User {
        get title() {
          return "Mr."
        }

        get fullName() {
          return `${this.title} ${this.firstName} ${this.lastName}`
        }

        getFullName() {
          return `${this.title} ${this.firstName} ${this.lastName}`
        }
      }

      const tree = new Tree({
        user: {
          firstName: "Diego",
          lastName: "Borges",
        }
      })

      tree.register("/user", User)

      const user = tree.root.user
      expect(user.fullName).to.eq("Mr. Diego Borges")
      expect(user.getFullName()).to.eq("Mr. Diego Borges")

      user.lastName = "Lima"

      expect(user.lastName).to.eq("Borges")
      expect(tree.root.user.lastName).to.eq("Lima")
      expect(tree.root.user.getFullName()).to.eq("Mr. Diego Lima")
      expect(tree.root.user.fullName).to.eq("Mr. Diego Lima")
    })

    it("supports model inheritance", () => {

      @Model
      class User {
        get title() {
          return "Mr."
        }

        get fullName() {
          return `${this.title} ${this.firstName} ${this.lastName}`
        }
      }

      class Customer extends User {
        get title() {
          return "Mr. customer"
        }
      }

      const tree = new Tree({
        user: {
          firstName: "Diego",
          lastName: "Borges",
        }
      })

      tree.register("/user", Customer)

      const user = tree.root.user
      expect(user.fullName).to.eq("Mr. customer Diego Borges")
    })

    // NOTE this is a current limitation in Arbor. Due to how es6 binds arrow
    // functions to the receiver's scope, it is not possible to overide the
    // receiver so it points to the proxy as it does on getters and regular
    // methods.
    it("cannot bind arrow function properties to the proxied tree node", () => {

      @Model
      class User {
        get title() {
          return "Mr."
        }

        fullName = () => {
          return `${this.title} ${this.firstName} ${this.lastName}`
        }
      }

      const tree = new Tree({
        user: {
          firstName: "Diego",
          lastName: "Borges",
        }
      })

      tree.register("/user", User)

      const user = tree.root.user
      expect(user.fullName()).to.eq("Mr. undefined undefined")
    })
  })
})
