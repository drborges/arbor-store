# Arbor

Seamless state management made with ❤️.

# What is it?

# Getting Started

TODO...

A simple Counter APP...

```jsx
import React from "react"
import Store, { connect } from "arbor-store"

const CounterApp = ({ counter }) => {
  return (
    <div>
      <span>{counter.count}</span>
      <button onClick={() => counter.count++} />
    </div>
  )
}

const store = new Store({
  counter: {
    count: 0,
  }
})

export default connect(store)(CounterApp)
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

Additionally, subscription to specific Store `Path` mutations are supported:

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

TODO

![2017-12-14 20 51 16](https://user-images.githubusercontent.com/508128/34018352-9d031a56-e110-11e7-9e3f-9f30a3c2e8ad.gif)

# Data Model Layer

Model classes may be used to represent a path(s) within the State Tree. Take the following `Store` as an example:

See the [spike branch](https://github.com/drborges/arbor/tree/feature/arbor-model) for more insights...

```jsx
const store = new Store({
  users: [],
  board: {
    todos: [],
    doing: [],
    done: [],
  },
})

store.bind(User, Board, Todo)
```

A model class can then be created to represent a TODO `Board` by simple adding the decorator `@Model` with the path within the state tree containing the board data.

```jsx
@Model("/board")
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

Now whenever one access `store.board`, and instance of `Board` will be provided.

A model class may be bound to multiple paths within the state tree as well:

```jsx
@Model(
  "/board/todos/:index",
  "/board/doing/:index",
  "/board/done/:index",
)
class Todo {
  finish() {
    this.status = "done"
  }

  start() {
    this.status = "doing"
  }
}
```

In order to implement a model that represents a list of nodes within the state tree, simply extend the `Array` class.

```jsx
@Model(
  "/board/todos",
  "/board/doing",
  "/board/done",
)
class TodoList extends Array {
  sort() {
    // custom sorting logic for todos
  }
}
```

The model above represents different lists of TODO entries.

### Connecting a React component to an arbor store

```jsxx
import Store, { connect } from "arbor-store"

class BoardView extends React.Component {
  render() {
    return (
      <Board onCreateTodo={this.state.board.createTodo}>
        <Column title="Todos" data={this.state.board.todos} />
        <Column title="Todos" data={this.state.board.doing} />
        <Column title="Todos" data={this.state.board.done} />
      </Board>
    )
  }
}

const store = new Store(...)
export default connect(store)(BoardView)
```

Once an Arbor store is connected to your React container, you may interact with
the component's `this.state` normally, mutations to the state instance variable
are handled by arbor via proxies under the hoods so that they happen in an
immutable fashion, just like Redux, allowing React to re-render the UI in an
optimal way.
