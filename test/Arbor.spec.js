import sinon from "sinon"
import { expect } from "chai"

import Arbor, { ObjectNode, ArrayNode, Path } from "../src"

describe("Arbor", () => {
  const initialState = {
    todos: [
      { id: 1, status: "todo" },
      { id: 2, status: "done" },
    ]
  }

  it("creates a state tree with initial data", () => {
    const tree = new Arbor(initialState)

    expect(tree.state).to.not.eq(initialState)
    expect(tree.state).to.deep.eq(initialState)
  })

  it("wraps state tree nodes within their corresponding node class types", () => {
    const tree = new Arbor(initialState)

    expect(tree.state.constructor).to.eq(ObjectNode)
    expect(tree.state.todos.constructor).to.eq(ArrayNode)
    expect(tree.state.todos[0].constructor).to.eq(ObjectNode)
    expect(tree.state.todos[1].constructor).to.eq(ObjectNode)
  })

  it("adds nodes to the state tree via dot notation", () => {
    const tree = new Arbor(initialState)

    tree.state.todos[0].status = "done"

    expect(tree.state.todos[0].status).to.eq("done")
  })

  it("caches accessed nodes", () => {
    const tree = new Arbor(initialState)

    expect(tree.state.todos).to.eq(tree.state.todos)
    expect(tree.state.todos[0]).to.eq(tree.state.todos[0])
    expect(tree.state.todos[1]).to.eq(tree.state.todos[1])
  })

  describe("#mutate", () => {
    it("mutates node within a given mutation path", () => {
      const tree = new Arbor(initialState)
      const state = tree.state

      tree.mutate(Path.parse("/todos/0"), (node) => {
        node.$value.status = "done"
      })

      expect(tree.state).to.deep.eq({
        todos: [
          { id: 1, status: "done" },
          { id: 2, status: "done" },
        ]
      })
    })

    it("does not mutate initial state", () => {
      const tree = new Arbor(initialState)
      const state = tree.state

      tree.mutate(Path.parse("/todos/0"), (node) => {
        node.$value.status = "done"
      })

      expect(initialState).to.deep.eq({
        todos: [
          { id: 1, status: "todo" },
          { id: 2, status: "done" },
        ]
      })
    })

    it("only mutates nodes affected by the mutation path", () => {
      const tree = new Arbor(initialState)
      const state = tree.state

      tree.mutate(Path.parse("/todos/0"), (node) => {
        node.$value.status = "done"
      })

      expect(tree.state).to.not.eq(state)
      expect(tree.state.todos).to.not.eq(state.todos)
      expect(tree.state.todos[0]).to.not.eq(state.todos[0])
      expect(tree.state.todos[1]).to.eq(state.todos[1])
    })
  })

  context("ArrayNode", () => {
    describe("#filter", () => {
      it("filters out items off of the ArrayNode", () => {
        const tree = new Arbor(initialState)

        const todos = tree.state.todos.filter(todo => todo.id === 2)

        expect(todos.constructor).to.eq(Array)
        expect(todos[0].constructor).to.eq(ObjectNode)
        expect(todos[0].$path.toString()).to.eq("/todos/1")
        expect(todos).to.deep.eq([
          { id: 2, status: "done" }
        ])
      })
    })

    describe("#push", () => {
      it("returns the updated items count within the ArrayNode", () => {
        const tree = new Arbor(initialState)

        const count = tree.state.todos.push({ id: 3, status: "todo" })

        expect(count).to.eq(3)
      })

      it("appends a new item to the ArrayNode", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.push({ id: 3, status: "todo" })

        expect(tree.state.todos[2].constructor).to.eq(ObjectNode)
        expect(tree.state.todos[2].$path.toString()).to.eq("/todos/2")
        expect(tree.state.todos).to.deep.eq([
          { id: 1, status: "todo" },
          { id: 2, status: "done" },
          { id: 3, status: "todo" },
        ])
      })

      it("does not mutate initial state", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.push({ id: 3, status: "todo" })

        expect(initialState).to.deep.eq({
          todos: [
            { id: 1, status: "todo" },
            { id: 2, status: "done" },
          ]
        })
      })

      it("keeps node items' paths up-to-date", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.push({ id: 3, status: "todo" })

        expect(tree.state.todos[0].$path.toString()).to.eq("/todos/0")
        expect(tree.state.todos[1].$path.toString()).to.eq("/todos/1")
      })
    })

    describe("#pop", () => {
      it("does not mutate initial state", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.pop()

        expect(initialState).to.deep.eq({
          todos: [
            { id: 1, status: "todo" },
            { id: 2, status: "done" },
          ]
        })
      })

      it("returns the node value popped from the ArrayNode", () => {
        const tree = new Arbor(initialState)

        const value = tree.state.todos.pop()

        expect(value.constructor).to.not.eq(ObjectNode)
        expect(value).to.deep.eq({ id: 2, status: "done" })
      })

      it("pops last item from the ArrayNode", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.pop()

        expect(tree.state).to.deep.eq({
          todos: [
            { id: 1, status: "todo" },
          ]
        })
      })

      it("keeps node items' paths up-to-date", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.pop()

        expect(tree.state.todos[0].$path.toString()).to.eq("/todos/0")
      })
    })

    describe("#shift", () => {
      it("does not mutate initial state", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.shift()

        expect(initialState).to.deep.eq({
          todos: [
            { id: 1, status: "todo" },
            { id: 2, status: "done" },
          ]
        })
      })

      it("returns the node value shifted off of the ArrayNode", () => {
        const tree = new Arbor(initialState)

        const value = tree.state.todos.shift()

        expect(value.constructor).to.not.eq(ObjectNode)
        expect(value).to.deep.eq({ id: 1, status: "todo" })
      })

      it("shifts first item off of the ArrayNode", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.shift()

        expect(tree.state).to.deep.eq({
          todos: [
            { id: 2, status: "done" },
          ]
        })
      })

      it("keeps node items' paths up-to-date", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.shift()

        expect(tree.state.todos[0].$path.toString()).to.eq("/todos/0")
      })
    })

    describe("#unshift", () => {
      it("does not mutate initial state", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.unshift(
          { id: 3, status: "todo" },
          { id: 4, status: "todo" },
        )

        expect(initialState).to.deep.eq({
          todos: [
            { id: 1, status: "todo" },
            { id: 2, status: "done" },
          ]
        })
      })

      it("returns the items count of the ArrayNode", () => {
        const tree = new Arbor(initialState)

        const count = tree.state.todos.unshift(
          { id: 3, status: "todo" },
          { id: 4, status: "todo" },
        )

        expect(count).to.eq(4)
      })

      it("adds new items to the begining of the ArrayNode", () => {
        const tree = new Arbor(initialState)

        const count = tree.state.todos.unshift(
          { id: 3, status: "todo" },
          { id: 4, status: "todo" },
        )

        expect(tree.state).to.deep.eq({
          todos: [
            { id: 3, status: "todo" },
            { id: 4, status: "todo" },
            { id: 1, status: "todo" },
            { id: 2, status: "done" },
          ]
        })
      })

      it("keeps node items' paths up-to-date", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.unshift(
          { id: 3, status: "todo" },
          { id: 4, status: "todo" },
        )

        expect(tree.state.todos[0].$path.toString()).to.eq("/todos/0")
        expect(tree.state.todos[1].$path.toString()).to.eq("/todos/1")
        expect(tree.state.todos[2].$path.toString()).to.eq("/todos/2")
        expect(tree.state.todos[3].$path.toString()).to.eq("/todos/3")
      })
    })

    describe("#copyWithin", () => {
      it("does not mutate initial state", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.copyWithin(1, 0, 1)

        expect(initialState).to.deep.eq({
          todos: [
            { id: 1, status: "todo" },
            { id: 2, status: "done" },
          ]
        })
      })

      it("returns the new ArrayNode with the internally copied item", () => {
        const tree = new Arbor(initialState)

        const node = tree.state.todos.copyWithin(1, 0, 1)

        expect(tree.state.todos).to.eq(node)
      })

      it("copies the first item over to the second position of the ArrayNode", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.copyWithin(1, 0, 1)

        expect(tree.state.todos[0]).to.eq(tree.state.todos[1])
        expect(tree.state).to.deep.eq({
          todos: [
            { id: 1, status: "todo" },
            { id: 1, status: "todo" },
          ]
        })
      })

      it("keeps node items' paths up-to-date", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.copyWithin(1, 0, 1)

        expect(tree.state.todos[0].$path.toString()).to.eq("/todos/0")
        expect(tree.state.todos[1].$path.toString()).to.eq("/todos/0")
      })
    })

    describe("#sort", () => {
      it("does not mutate initial state", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.sort((a, b) => b.id - a.id)

        expect(initialState).to.deep.eq({
          todos: [
            { id: 1, status: "todo" },
            { id: 2, status: "done" },
          ]
        })
      })

      it("returns the new sorted ArrayNode", () => {
        const tree = new Arbor(initialState)

        const node = tree.state.todos.sort((a, b) => b.id - a.id)

        expect(tree.state.todos).to.eq(node)
      })

      it("sorts the ArrayNode items", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.sort((a, b) => b.id - a.id)

        expect(tree.state).to.deep.eq({
          todos: [
            { id: 2, status: "done" },
            { id: 1, status: "todo" },
          ]
        })
      })

      it("keeps node items' paths up-to-date", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.sort((a, b) => b.id - a.id)

        expect(tree.state.todos[0].$path.toString()).to.eq("/todos/0")
        expect(tree.state.todos[1].$path.toString()).to.eq("/todos/1")
      })
    })

    describe("#splice", () => {
      it("does not mutate initial state", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.splice(0, 1, { id: 3, status: "todo" }, { id: 4, status: "todo" })

        expect(initialState).to.deep.eq({
          todos: [
            { id: 1, status: "todo" },
            { id: 2, status: "done" },
          ]
        })
      })

      it("returns the items deleted from the ArrayNode", () => {
        const tree = new Arbor(initialState)

        const deletedItems = tree.state.todos.splice(0, 1, { id: 3, status: "todo" }, { id: 4, status: "todo" })

        expect(deletedItems).to.deep.eq([
          { id: 1, status: "todo" }
        ])
      })

      it("sorts the ArrayNode items", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.splice(0, 1, { id: 3, status: "todo" }, { id: 4, status: "todo" })

        expect(tree.state).to.deep.eq({
          todos: [
            { id: 3, status: "todo" },
            { id: 4, status: "todo" },
            { id: 2, status: "done" },
          ]
        })
      })

      it("keeps node items' paths up-to-date", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.splice(0, 1, { id: 3, status: "todo" }, { id: 4, status: "todo" })

        expect(tree.state.todos[0].$path.toString()).to.eq("/todos/0")
        expect(tree.state.todos[1].$path.toString()).to.eq("/todos/1")
        expect(tree.state.todos[2].$path.toString()).to.eq("/todos/2")
      })
    })

    describe("#reverse", () => {
      it("does not mutate initial state", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.reverse()

        expect(initialState).to.deep.eq({
          todos: [
            { id: 1, status: "todo" },
            { id: 2, status: "done" },
          ]
        })
      })

      it("returns the new reversed ArrayNode", () => {
        const tree = new Arbor(initialState)

        const node = tree.state.todos.reverse()

        expect(node).to.deep.eq([
          { id: 2, status: "done" },
          { id: 1, status: "todo" },
        ])
      })

      it("updates the state tree with the reversed node value", () => {
        const tree = new Arbor(initialState)

        const node = tree.state.todos.reverse()

        expect(tree.state.todos).to.eq(node)
      })

      it("keeps node items' paths up-to-date", () => {
        const tree = new Arbor(initialState)

        tree.state.todos.reverse()

        expect(tree.state.todos[0].$path.toString()).to.eq("/todos/0")
        expect(tree.state.todos[1].$path.toString()).to.eq("/todos/1")
      })
    })
  })

  describe("#subscribe", () => {
    it("allows subscribers to be notified about state changes", () => {
      const subscriber = sinon.spy()
      const tree = new Arbor(initialState)
      const previousState = tree.state

      tree.subscribe(subscriber)
      tree.state.todos[0].status = "done"

      expect(subscriber).to.have.been.calledWith(tree.state, previousState)
    })

    it("allows unsubscribing from state change notifications", () => {
      const subscriber = sinon.spy()
      const tree = new Arbor(initialState)
      const previousState = tree.state

      const unsubscribe = tree.subscribe(subscriber)
      unsubscribe()
      tree.state.todos[0].status = "done"

      expect(subscriber).to.have.not.been.calledWith(tree.state, previousState)
    })
  })

  describe("#bind", () => {
    it("binds a custom node implementation to a given state tree path", () => {
      class Todo {}

      const tree = new Arbor(initialState)

      tree.bind("/todos/:index", Todo)

      expect(tree.state.todos[0]).to.be.an.instanceOf(Todo)
      expect(tree.state.todos[1]).to.be.an.instanceOf(Todo)
    })

    it("allows accessing getters defined by custom node type", () => {
      class Todo {
        constructor({ id, status }) {
          this.id = id
          this.status = status
        }

        get title() {
          return `Todo ${this.id}: ${this.status}`
        }
      }

      const tree = new Arbor(initialState)
      tree.bind("/todos/:index", Todo)

      expect(tree.state.todos[0].title).to.eq("Todo 1: todo")
      expect(tree.state.todos[1].title).to.eq("Todo 2: done")
    })

    it("allows accessing methods defined by custom node type", () => {
      class Todo {
        constructor({ id, status }) {
          this.id = id
          this.status = status
        }

        title() {
          return `Todo ${this.id}: ${this.status}`
        }
      }

      const tree = new Arbor(initialState)
      tree.bind("/todos/:index", Todo)

      expect(tree.state.todos[0].title()).to.eq("Todo 1: todo")
      expect(tree.state.todos[1].title()).to.eq("Todo 2: done")
    })

    it("allows accessing arrow functions defined by custom node type", () => {
      class Todo {
        constructor({ id, status }) {
          this.id = id
          this.status = status
        }

        title = () => {
          return `Todo ${this.id}: ${this.status}`
        }
      }

      const tree = new Arbor(initialState)
      tree.bind("/todos/:index", Todo)

      expect(tree.state.todos[0].title()).to.eq("Todo 1: todo")
      expect(tree.state.todos[1].title()).to.eq("Todo 2: done")
    })

    it("allows calling bound methods defined by the custom node type", () => {
      class Todo {
        constructor({ id, status }) {
          this.id = id
          this.status = status
        }

        title() {
          return `Todo ${this.id} at ${this.$path.toString()}`
        }
      }

      const tree = new Arbor(initialState)
      tree.bind("/todos/:index", Todo)

      const firstTodoNode = tree.state.todos[0]
      const secondTodoNode = tree.state.todos[1]
      const firstTodoTitle = firstTodoNode.title.bind(firstTodoNode)
      const secondTodoTitle = secondTodoNode.title.bind(secondTodoNode)

      expect(firstTodoTitle()).to.eq("Todo 1 at /todos/0")
      expect(secondTodoTitle()).to.eq("Todo 2 at /todos/1")
    })
  })
})
