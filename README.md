# rest-store

State management made with ❤️.

# TODO

- [ ] Rename arbor.js file to store.js
- [ ] Rename Tree.js to Tree.js
- [ ] Hide Path.js from the outside world.
- [ ] Hide store.js from the outside world.

# Thoughts

### Mutation Subscriptions

**Provided by** `arbor`

```js
const store = new Store({
  users: [],
  board: {
    todos: [],
    doing: [],
    done: [],
  },
})

store.subscribe("/users", (users) => console.log("users list changed!", users))

store.subscribe("/users/push", (users) => console.log("New user added to array", user, users))

store.subscribe("/users/splice", (users, args) => console.log("Users list was spliced with", args))
// args => [0, 1, [{ name: "New user" }]]
// users => [{ name: "New user" }]

store.subscribe("/board", (board) => console.log("TODO board was changed!", board))
```

### @app.model: Data Layer

**Provided by** `arbor-model`

#### Data Model

Model classes may be used to represent a path(s) within the State Tree. Take the following `Store` as an example:

```js
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

```js
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

```js
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

```js
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

**Provided by** `arbor`

```jsx
import Store, { connect } from "arbor"

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

### arbor-timetravel Package

Provides state timetravel functionality.

```js
import withTimeline from "arbor-timeline"

const storeWithTimeline = withTimeline(new Store)
storeWithTimeline.start()
storeWithTimeline.previous()
storeWithTimeline.previous()
storeWithTimeline.previous(2)
storeWithTimeline.next(1)
storeWithTimeline.stop()
```
