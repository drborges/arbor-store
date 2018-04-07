# Arbor

[![npm version](https://badge.fury.io/js/arbor-store.svg)](https://badge.fury.io/js/arbor-store) [![Build Status](https://travis-ci.org/drborges/arbor-store.svg?branch=master)](https://travis-ci.org/drborges/arbor-store)

Seamless state management made with ❤️.

# What is it?

Arbor is a state management solution that leverages **immutability** to achieve mutations to the current state tree. Even though immutability is Arbor's foundation, very **little boilerplate** is added to the developer's workflow and mutations are triggered via the old and familiar Javascript Object/Array APIs (thanks to **es6 Proxies** under the hoods).

Sounds cool, right? Well, it gets better... Arbor also provides ways to bind custom **model classes** to State Tree paths, allowing UI and business logics to be decoupled in a nice, predictable and testable fashion.

Arbor is framework agnostic, though, there is a [React](https://github.com/drborges/arbor-react) binding already ready for you.

**Disclaimer:** This is work in progress and very little optimizations were applied, thus, there is room for improvement (PRs are very welcome).

# Getting Started

A simple Counter APP...

```js
import Arbor from "arbor-store"

const store = new Arbor({
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

Take the following store:

```js
import Arbor from "arbor-store"

const store = new Arbor({
  users: [
    { name: "Jon", posts: [] },
    { name: "Snow", posts: [{ title: "Winter is coming..." }] },
  ]
})
```

You may subscribe to **any** state changes as such:

```js
store.subscribe((currentState, previousState) => {
  console.log("New state:", currentState, "Old state:", previousState)
})
```

Optionally, you may subscribe to mutations on a specific paths within the State Tree:

```js
store.subscribe("/users", (currentUsersState, previousUsersState) => {
  console.log("New state:", currentUsersState, "Old state:", previousUsersState)
})

store.subscribe("/users/:index/posts/:index", (currentPostState, previousPostState) => {
  console.log("New state:", currentPostState, "Old state:", previousPostState)
})
```

# Data Model Layer

Model classes may be used to represent specific nodes within the State Tree. Take the following store as an example:

```js
import Arbor from "arbor-store"

const store = new Arbor({
  users: [],
  board: {
    todos: [],
    doing: [],
    done: [],
  },
})
```

Models are just simple es6 classes that are explicitly bound to certain paths of the state tree. The following class, for example:

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
  id: number
  title: string
  status: ?string

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

Models can represent any State Tree path, even paths pointing to array nodes:

```js
class TodoList {
  sortByTitle() {
    this.sort((todo1, todo2) => {
      if (todo1.title > todo2.title) return 1
      if (todo1.title < todo2.title) return -1
      return 0
    })
  }
}

store.bind(TodoList).to(
  "/board/todos",
  "/board/doing",
  "/board/done",
)
```

# State Tree Time Travel

Arbor leverages **Structural Sharing** in order to perform state mutations. A new state tree is always created by applying the minimum amount of operations necessary to generate the new state. With this, a series of state snapshots may be recorded, allowing for interesting use cases such as [State Time Travel](https://github.com/drborges/arbor-timetravel).

![2017-12-14 20 51 16](https://user-images.githubusercontent.com/508128/34018352-9d031a56-e110-11e7-9e3f-9f30a3c2e8ad.gif)

# License

MIT
