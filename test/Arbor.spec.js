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

    it("supports transactions", () => {
      const tree = new Arbor({
        todos: [
          { title: "Todo 1", comments: [{ text: "Comment todo 1", views: 0 }]},
          { title: "Todo 2", comments: [{ text: "Comment todo 2", views: 0 }]},
        ]
      })

      tree.mutate(Path.parse("/todos"), (todos) => {
        const comment = todos[0].comments[0]
        comment.views++
        comment.views++
        expect(comment.$refreshed.views).to.eq(2)
      })

      expect(tree.state.todos[0].comments).to.deep.eq([
        { text: "Comment todo 1", views: 2 }
      ])
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

      it("triggers a single mutation", () => {
        const tree = new Arbor(initialState)
        const subscriber = sinon.spy()

        tree.subscribe(subscriber)
        tree.state.todos.push({ id: 3, status: "todo" })

        expect(subscriber).to.have.been.calledOnce
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

        tree.state.todos.splice(0, 1)

        expect(tree.state.todos[0].$path.toString()).to.eq("/todos/0")
      })

      it("triggers a single mutation", () => {
        const tree = new Arbor(initialState)
        const subscriber = sinon.spy()

        tree.subscribe(subscriber)
        tree.state.todos.splice(0, 1)

        expect(subscriber).to.have.been.calledOnce
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

    it("allows calling bound methods defined by the proxy handler", () => {
      class Todo {
        constructor({ id, status }) {
          this.id = id
          this.status = status
        }
      }

      const tree = new Arbor(initialState)
      tree.bind("/todos/:index", Todo)

      const node = tree.state.todos[0]
      const mutateFn = node.$mutate.bind(node)
      mutateFn(node => {
        node.status = "done"
      })

      expect(tree.state.todos[0].status).to.eq("done")
    })
  })

  describe("#$mutate", () => {
    it("does not mutate original state", () => {
      const initialState = {
        counter1: {
          count: 0
        }
      }

      const tree = new Arbor(initialState)
      const state = tree.state

      tree.state.$mutate(state => {
        state.counter1.count++
      })

      expect(initialState).to.deep.eq(state)
      expect(initialState).to.deep.eq({
        counter1: {
          count: 0
        }
      })
    })

    it("read-only access does not affect the state", () => {
      const tree = new Arbor({
        counter1: {
          count: 0
        }
      })

      tree.state.$mutate(state => {
        state.counter1.count
        state.counter1
      })

      expect(tree.state).to.deep.eq({
        counter1: {
          count: 0
        }
      })
    })

    it("accessing 'undefined' props does not raise errors", () => {
      const tree = new Arbor({
        counter1: {
          count: 0
        }
      })

      tree.state.$mutate(state => {
        state.noCanDo
      })

      expect(tree.state).to.deep.eq({
        counter1: {
          count: 0
        }
      })
    })

    it("access to the same path yield the same object", () => {
      const tree = new Arbor({
        counter: {
          count: 0
        }
      })

      tree.state.$mutate(state => {
        expect(state.counter).to.eq(state.counter)
      })
    })

    it("mutates state via structural sharing", () => {
      const tree = new Arbor({
        counter1: {
          count: 0
        },
        counter2: {
          count: 0
        },
      })

      const previousState = tree.state

      tree.state.$mutate(state => {
        state.counter1.count++
        state.counter1.count++
      })

      expect(tree.state).to.not.eq(previousState)
      expect(tree.state.counter1).to.not.eq(previousState.counter1)
      expect(tree.state.counter2).to.eq(previousState.counter2)
      expect(tree.state).to.deep.eq({
        counter1: {
          count: 2
        },
        counter2: {
          count: 0
        },
      })
    })

    it("mutations within the same mutation path don't affect each other", () => {
      const tree = new Arbor({
        counter: {
          count: 0
        }
      })

      tree.state.counter.$mutate(counter => {
        counter.count++
        counter.count2 = 2
      })

      expect(tree.state).to.deep.eq({
        counter: {
          count: 1,
          count2: 2,
        }
      })
    })

    it("triggers a single mutation notification", () => {
      const tree = new Arbor({
        counter: {
          count: 0
        }
      })

      const previousState = tree.state
      const spiedSubscriptions = sinon.spy(tree.subscriptions, "notify")

      tree.state.counter.$mutate(counter => {
        counter.count++
        counter.count++
        counter.count++
      })

      expect(spiedSubscriptions).to.have.been.calledOnce
      expect(spiedSubscriptions).to.have.been.calledWith(tree.state, previousState)
    })

    it("atomically mutates array nodes", () => {
      const tree = new Arbor({
        todos: [
          { title: "Clean the house" },
          { title: "Do the dishes" },
        ]
      })

      const previousState = tree.state

      tree.state.todos.$mutate(todos => {
        todos.reverse()
      })

      expect(tree.state).to.not.eq(previousState)
      expect(tree.state.todos).to.not.eq(previousState.todos)
      expect(tree.state.todos[0]).to.not.eq(previousState.todos[0])
      expect(tree.state.todos[1]).to.not.eq(previousState.todos[1])
      expect(tree.state).to.deep.eq({
        todos: [
          { title: "Do the dishes" },
          { title: "Clean the house" },
        ]
      })
    })
  })
})
