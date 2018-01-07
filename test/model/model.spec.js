
import sinon from "sinon"
import { expect } from "chai"

import Arbor from "../../src"

describe("Model", () => {
  it("binds a custom model class to a given path within the tree", () => {
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

    expect(tree.root.users[0].constructor).to.eq(User)
    expect(tree.root.users[0].formalName).to.eq("Mr. Diego")
  })

  it("binds a custom model class to multiple paths within the tree", () => {
    class Person {}

    const tree = new Arbor({
      users: [
        { name: "Diego", age: 32 },
      ],
      customers: [
        { name: "Diego", age: 32 },
      ],
    })

    tree.bind(Person).to(
      "/users/:index",
      "/customers/:index",
    )

    expect(tree.root.users[0].constructor).to.eq(Person)
    expect(tree.root.customers[0].constructor).to.eq(Person)
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

    expect(tree.root.users[0].posts[0].constructor).to.eq(Post)
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
