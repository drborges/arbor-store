import sinon from "sinon"
import { expect } from "chai"

import MTree, { Model } from "../../src/mtree"

describe("MTree", () => {
  it("registers a custom node handler to a given path", () => {

    @Model
    class User {}

    const tree = new MTree({
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

    const tree = new MTree({
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

    const tree = new MTree({
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

    const tree = new MTree({
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

    const tree = new MTree({
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

    const tree = new MTree({
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
