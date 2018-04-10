# Arbor

[![npm version](https://badge.fury.io/js/arbor-store.svg)](https://badge.fury.io/js/arbor-store) [![Build Status](https://travis-ci.org/drborges/arbor-store.svg?branch=master)](https://travis-ci.org/drborges/arbor-store)

Seamless state management made with ❤️.

# What is it?

Arbor is a state tree management solution that leverages **immutability** through structural sharing to perform state tree mutations allowing subscribers to listen to state changes.

Even though immutability is Arbor's foundation, very **little boilerplate** is added to the developer's workflow and mutations are triggered via the old and familiar Javascript Object/Array APIs (thanks to **ES6 Proxies** under the hoods). Because Arbor mutations apply structural sharing under the hoods, features like state history playback and undos are easily implemented.

Additionally, Arbor allows custom types to be bound the specific paths within the state tree so you may better encapsulate your business logic keeping them separate from UI logic, increasing testability as well as business logic reusability.

Arbor is framework agnostic, though, there is a [React](https://github.com/drborges/arbor-react) binding that you can check out.

# Getting Started

A simple Counter APP...

```js
import Arbor from "arbor-store"

const store = new Arbor({
  counter1: {
    count: 0,
  },
  counter2: {
    count: 0,
  }
})

store.subscribe((nextState, previousState) => {
  console.log("new state:", nextState)
  console.log("old state:", previousState)
})

store.state.counter1.count++
```

## Breaking it down

### The State Tree

```js
const store = new Arbor({
  counter1: {
    count: 0,
  },
  counter2: {
    count: 0,
  }
})
```

The snippet above defines a store whose state tree looks like this:

```
          (root)
          /    \
(counter1)     (counter2)
    |              |
  count = 0      count = 0
```

In the state tree, `(root)`, `(counter1)` and `(counter2)` are tree node objects responsible for all the immutability "magic". Each node has a path that determines its location within the state tree. `(root)` for example is represented by the `/` path, `(counter1)` is represented by `/counter1` and `(counter2)` represented by `/counter2`. Leaf nodes within the state tree are non-node types (`count` attributes).

### Mutation Subscriptions

The code below registers a subscriber function which is called whenever a mutation happens in the state tree, providing access to the next and previous states.

```js
store.subscribe((nextState, previousState) => {
  console.log("new state:", nextState)
  console.log("old state:", previousState)
})
```

### Mutations

```js
store.state.counter1.count++
```

Every mutation triggered by any node creates a **mutation path** that determines which  nodes in the state tree were affected by the mutation and thus must be refreshed with new instances.

Once a mutation is finished, a new state tree is generated where nodes affected by the mutation path have their instances refreshed and nodes not affected by the mutation path are kept untouched (Structural Sharing), for instance:

Triggers a mutation in the state tree for the mutation path `/counter1`. That mutation path affects the `(root)` node whose path is `/`, and the `(counter1)` node whose path is `/counter1`. Since `(counter2)` whose path is `/counter2` is not affected by the mutation path, it is reused in the new state tree:

```
          (root*)
          /    \
(counter1*)     (counter2)
    |              |
  count = 1      count = 0
```

Nodes marked with a `*` in the state tree above represent the nodes affected by the mutation path and thus are new node instances.

# Splitting Business logic From UI Logic

As React applications grow larger, splitting business and UI logic can get tricky. Arbor allows custom node types to be bound to specific paths within the state tree, where business logic code can be encapsulated increasing testability and maintainability.

Custom node types are just plain ES6 classes that are explicitly bound to certain paths of the state tree and provide a constructor which "selects" what state attributes it cares about, for example:

```js
class Todo {
  constructor({ id, title, status }) {
    this.id = id
    this.title = title
    this.status = status
  }

  start() {
    this.status = "doing"
  }

  finish() {
    this.status = "done"
  }
 }

 const store = new Arbor({
   todos: [
     { id: 1, title: "Do the dishes", status: "todo" },
     { id: 2, title: "Clean the house", status: "todo" }
   ]
 })

 store.bind("/todos/:index", Todo)
```

The example above defines a custom node type `Todo` and binds it to the `/todos/:index` path. There are a few things to notice here:

1. The custom type `Todo` implements a constructor which takes all properties that make up a todo item.
2. Business logic is defined by the new custom type for starting and finishing a todo.
3. The custom type is bound to a **wildcard** path where `:index` represents any todo item within the todos array. Any access to any todo item in the array, will yield an instance of `Todo`, e.g.:

```js
const todo = store.state.todos[0]
expect(todo).to.be.an.instanceOf(Todo)
```

Custom node types can represent either objects or array nodes within the State Tree. Custom array nodes must extend `Array`:

```js
class Todos extends Array {
  constructor(items) {
    super(...items)
  }

  createTodo({ title }) {
    this.push({ id: Math.random(), title })
  }

  startTodo(index) {
    this[index].start()
  }

  finishTodo(index) {
    this[index].finish()
  }

  sortByTitle() {
    this.sort((todo1, todo2) => {
      if (todo1.title > todo2.title) return 1
      if (todo1.title < todo2.title) return -1
      return 0
    })
  }
}

store.bind("/todos", Todos)
```

# State Tree Time Travel

Arbor leverages **Structural Sharing** in order to perform state mutations. A new state tree is always created by applying the minimum amount of operations necessary to generate the new state. With this, a series of state snapshots may be recorded, allowing for interesting use cases such as [State Time Travel](https://github.com/drborges/arbor-timetravel).

![2017-12-14 20 51 16](https://user-images.githubusercontent.com/508128/34018352-9d031a56-e110-11e7-9e3f-9f30a3c2e8ad.gif)

# License

MIT
