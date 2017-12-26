# Arbor

Seamless state management made with ❤️.

# What is it?

This is work in progress, though, it's already pretty cool :)

# Getting Started

A simple Counter APP...

```js
import Store from "arbor-store"

const store = new Store({
  counter: {
    count: 0,
  }
})

store.state.counter.count++
// Triggers a mutation on the store, incrementing the count

store.state.counter.count--
// Triggers a mutation on the store, decrementing the count
```

# Mutation Subscriptions

Given the following store:

```js
const store = new Store({
  users: [],
  board: {
    todos: [],
    doing: [],
    done: [],
  },
})
```

One may subscribe to state changes as such:

```js
store.subscribe((state) => console.log("New state:", state))
```

Eventually (this is work in progress) subscriptions to specific mutation paths may be supported:

```js
store.subscribe("/users", (users) => {
  console.log("users list changed!", users)
})

store.subscribe("/users/push", (users, args) => {
  console.log("New user added to array", users, args)
})

store.subscribe("/board/todos/:index", (todo, index) => {
  console.log(`Todo ${index} was updated:`, todo)
})
```

# State Tree Time Travel

Arbor leverages Structural Sharing in order to perform state mutations. A new
state tree is always created by applying the minimum amount of operations
necessary to generate the new state. With this, a series of state snapshots may
be recorded, allowing for interesting use cases such as [State Time Travel](https://drborges.github.io/arbor-react-app).

![2017-12-14 20 51 16](https://user-images.githubusercontent.com/508128/34018352-9d031a56-e110-11e7-9e3f-9f30a3c2e8ad.gif)

# Data Model Layer

Model classes may be used to represent a path(s) within the State Tree. Take the following `Store` as an example:

```js
import Store, { MTree } from "arbor-store"

const store = new Store({
  users: [],
  board: {
    todos: [],
    doing: [],
    done: [],
  },
}, { Engine: MTree }) // Currently models are provided by a different engine
```

Models are just simple es6 classes that are explicitly bound to certain paths of the state tree. The following class:

```js
class Board {
  createTodo() {
    this.todos.push({ id: Math.random() })
  }

  startTodo(index: number) {
    const removed = this.todos.removeAt(index)
    this.doing.push(removed.start())
  }

  finishTodo(index: number) {
    const removed = this.doing.removeAt(index)
    this.doing.push(removed.finish())
  }
}
```

Can be bound to the `/board` path:

```js
store.bind(Board).to("/board")
```

Now, every access to `store.state.board` will yield an instance of `Board`.

Additionally, a model class may be bound to multiple paths within the state tree as well:

```js
class Todo {
  finish() {
    this.status = "done"
  }

  start() {
    this.status = "doing"
  }
}

store.bind(Todo).to(
  "/board/todos/:index",
  "/board/doing/:index",
  "/board/done/:index",
)
```

Models can represent any State Tree path, even array nodes:

```js
class TodoList {
  sortBy(propName) {
    // custom sorting logic for todos
  }
}

store.bind(TodoList).to(
  "/board/todos",
  "/board/doing",
  "/board/done",
)
```

#### Convention Over Configuration

This is a work in progress, but it would be nice if we could agree on a certain
convention so that models may be automatically bound to state tree paths without
the need for explicit mappings. Gotta be careful, though. Conventions over
configuration is good, but if taken too far they may create an awe environment
filled with "magical" behavior.
