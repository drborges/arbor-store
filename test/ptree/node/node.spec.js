import sinon from "sinon"
import { expect } from "chai"

import Tree, { Path } from "../../../src/ptree"

describe("Node", () => {
  describe("#get", () => {
    it("allows accessing methods only defined on the proxied target value", () => {
      const tree = new Tree({
        users: [
          { name: "Diego" }
        ]
      })

      expect(tree.root.users.hasOwnProperty(0)).to.eq(true)
    })

    it("does not evaluate 'falsy' props as 'undefined'", () => {
      const tree = new Tree({
        active: false,
        emptyText: "",
        zero: 0,
      })

      expect(tree.root.active).to.eq(false)
      expect(tree.root.emptyText).to.eq("")
      expect(tree.root.zero).to.eq(0)
    })

    it("returns 'null' for null props in target", () => {
      const tree = new Tree({
        data: null,
      })

      expect(tree.root.data).to.eq(null)
    })
  })

  describe("#set", () => {
    it("allows setting $children prop", () => {
      const tree = new Tree({
        user: { name: "Diego" }
      })

      expect(tree.root.user.$children).to.deep.eq({})

      tree.root.user.$children = { child: "fake child" }

      expect(tree.root.user.$children).to.deep.eq({ child: "fake child" })
    })

    it("allows setting $value prop", () => {
      const tree = new Tree({
        user: { name: "Diego" }
      })

      expect(tree.root.user.$value).to.deep.eq({ name: "Diego" })

      tree.root.user.$value = { child: "fake child" }

      expect(tree.root.user.$value).to.deep.eq({ child: "fake child" })
    })
  })

  describe("#transaction", () => {
    it("transactions node object atomically", () => {
      const subscriber = sinon.spy()
      const tree = new Tree({
        user: { name: "Diego" }
      })

      tree.subscribe(Path.root, subscriber)

      const user = tree.root.user

      user.transaction((node) => {
        node.name = "Borges"
        node.age = 32

        expect(node).to.not.eq(user)
        expect(node).to.deep.eq({
          name: "Borges",
          age: 32,
        })
      })

      expect(user).to.deep.eq({ name: "Diego" })
      expect(tree.root.user).to.deep.eq({
        name: "Borges",
        age: 32,
      })

      expect(subscriber).to.have.been.calledOnce
      expect(subscriber).to.have.been.calledWith({
        user: {
          name: "Borges",
          age: 32,
        }
      })
    })

    it("transactions node array atomically", () => {
      const subscriber = sinon.spy()
      const tree = new Tree({
        users: [{ name: "Diego" }],
      })

      tree.subscribe(Path.root, subscriber)

      const users = tree.root.users

      users.transaction((node) => {
        node.splice(0, 1)
        node.push({ name: "John" })

        expect(node).to.not.eq(users)
        expect(node).to.deep.eq([
          { name: "John" },
        ])
      })

      expect(users).to.deep.eq([{ name: "Diego" }])
      expect(tree.root.users).to.deep.eq([
        { name: "John" },
      ])

      expect(subscriber).to.have.been.calledOnce
      expect(subscriber).to.have.been.calledWith({
        users: [
          { name: "John" },
        ]
      })
    })

    it("throws an error upon nested transactions", () => {
      const subscriber = sinon.spy()
      const tree = new Tree({
        users: [{ name: "Diego" }],
      })

      tree.subscribe(Path.root, subscriber)

      const users = tree.root.users

      users.transaction((node) => {
        expect(() => node[0].transaction()).to.throw()
      })
    })

    it("throws an error when mutating node outside the transaction subtree", () => {
      const subscriber = sinon.spy()
      const tree = new Tree({
        users: [{ name: "Diego" }],
      })

      tree.subscribe(Path.root, subscriber)

      const users = tree.root.users

      users[0].transaction((user) => {
        expect(() => users.push({ name: "cannot mutate node outside transaction tree" })).to.throw()
      })
    })

    context("structural sharing", () => {
      it("caches children copies for futher accesses", () => {
        const tree = new Tree({
          users: [{ name: "Diego" }]
        })

        const users = tree.root.users

        users.transaction((node) => {
          const firstAccess = node[0]
          const secondAccess = node[0]

          expect(firstAccess).to.eq(secondAccess)
        })
      })

      it("state tree is only updated after transaction is finished", () => {
        const tree = new Tree({
          users: [{ name: "Diego" }]
        })

        const users = tree.root.users

        users.transaction((node) => {
          // one may trigger mutations on either `users` or `node` variables,
          // both will generate the same mutation path so the new state tree
          // can be created.
          users[0].name = "Borges"
          node[0].age = 32

          expect(node[0]).to.deep.eq({
            name: "Borges",
            age: 32,
          })

          expect(users[0]).to.deep.eq({ name: "Diego" })
          expect(tree.root.users[0]).to.deep.eq({ name: "Diego" })
        })

        expect(tree.root.users[0].name).to.eq("Borges")
      })

      it("mutations on child object is applied to a new copy", () => {
        const tree = new Tree({
          users: [{ name: "Diego" }]
        })

        const users = tree.root.users
        const user = tree.root.users[0]

        users.transaction((node) => {
          expect(node).to.not.eq(users)
          node[0].name = "Borges"
        })

        expect(users).to.deep.eq([{ name: "Diego" }])
        expect(tree.root.users).to.deep.eq([
          { name: "Borges" },
        ])
      })

      it("mutations on child array is applied to a new copy", () => {
        const tree = new Tree({
          users: [{ name: "Diego", posts: [{ title: "Nice" }]}]
        })

        const users = tree.root.users
        const user = tree.root.users[0]
        const posts = user.posts
        const post = posts[0]

        users.transaction((node) => {
          expect(node).to.not.eq(users)
          node[0].posts[0].title = "Sweet"
          expect(node[0]).to.not.eq(user)
          expect(node[0].posts).to.not.eq(posts)
          expect(node[0].posts[0]).to.not.eq(post)
        })

        expect(users).to.deep.eq([
          { name: "Diego", posts: [{ title: "Nice" }]}
        ])

        expect(tree.root.users).to.deep.eq([
          { name: "Diego", posts: [{ title: "Sweet" }]}
        ])
      })
    })
  })
})
