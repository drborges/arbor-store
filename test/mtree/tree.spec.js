import sinon from "sinon"
import { expect } from "chai"

import MTree from "../../src/mtree"

describe("MTree", () => {
  it("registers a custom node handler to a given path", () => {

    class User {}

    const tree = new MTree({
      user: {
        firstName: "Diego",
      }
    })

    tree.bind(User).to("/user")

    expect(tree.root.user.constructor.name).to.eq("bound Model")
    expect(tree.root.user.firstName).to.eq("Diego")
  })

  it("registers a custom node handler to a path with wildcard", () => {

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

    tree.bind(Post).to("/user/posts/:index")

    expect(tree.root.user.posts[0].constructor.name).to.eq("bound Model")
    expect(tree.root.user.posts[1].constructor.name).to.eq("bound Model")
    expect(tree.root.user.posts[2].constructor.name).to.eq("bound Model")
    expect(tree.root.user.posts[0]).to.deep.eq({ title: "Nice!" })
    expect(tree.root.user.posts[1]).to.deep.eq({ title: "Sweet!" })
    expect(tree.root.user.posts[2]).to.deep.eq({ title: "Super!" })
  })

  it("registers a model to multiple paths", () => {

    class Todo {}

    const tree = new MTree({
      board: {
        todos: [{ title: "Do the dishes" }],
        doing: [{ title: "Clean the house" }],
        done: [{ title: "Take the dog out" }],
      }
    })

    tree.bind(Todo).to(
      "/board/todos/:index",
      "/board/doing/:index",
      "/board/done/:index",
    )

    expect(tree.root.board.todos[0].constructor.name).to.eq("bound Model")
    expect(tree.root.board.doing[0].constructor.name).to.eq("bound Model")
    expect(tree.root.board.done[0].constructor.name).to.eq("bound Model")
  })

  it("allows custom API to perform mutations on the state tree", () => {

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

    tree.bind(User).to("/user")

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

    tree.bind(User).to("/user")

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

    tree.bind(Customer).to("/user")

    const user = tree.root.user
    expect(user.fullName).to.eq("Mr. customer Diego Borges")
  })

  it("allows passing methods around as reference", () => {

    class User {
      fullName() {
        return `${this.firstName} ${this.lastName}`
      }
    }

    const tree = new MTree({
      user: {
        firstName: "Diego",
        lastName: "Borges",
      }
    })

    tree.bind(User).to("/user")

    const fullNameFn = tree.root.user.fullName

    expect(fullNameFn()).to.eq("Diego Borges")
  })

  // NOTE this is a current limitation in Arbor. Due to how es6 binds arrow
  // functions to the receiver's scope, it is not possible to overide the
  // receiver so it points to the proxy as it does on getters and regular
  // methods.
  it("cannot bind arrow function properties to the proxied tree node", () => {

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

    tree.bind(User).to("/user")

    const user = tree.root.user
    expect(user.fullName()).to.eq("Mr. undefined undefined")
  })
})
