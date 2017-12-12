# rest-store

State management made with ❤️.

# TODO

- [ ] Rename arbor.js file to store.js
- [ ] Rename Tree.js to Tree.js
- [ ] Hide Path.js from the outside world.
- [ ] Hide store.js from the outside world.

# Thoughts

### Tree: Transactional Updates?

**Provided by** `arbor`

Allow for multiple mutations to happen within the same transaction, ultimately causing a single mutation to the Tree

```js
class App {

  startTodo(index) {
    app.state.transaction(() => {
      const removed = app.state.todos.removeAt(index)
      app.state.doing.push(removed)
    })
  }
}

class App {

  @app.transaction
  startTodo(index) {
    const removed = app.state.todos.removeAt(index)
    app.state.doing.push(removed)
  }
}
```

### @app.model: Data Layer

**Provided by** `arbor-model`

```jsx
const initialState = {
  users: [],
  board: {
    todos: [],
    doing: [],
    done: [],
  },
}

const app = new arbor(initialState)

app.subscribe("/users", (users) => console.log("users list changed!", users))

app.subscribe("/board", (board) => console.log("TODO board was changed!", board))
```

```js
@app.model("/board")
class Board {
  constructor({ todos, doing, done }) {
    this.todos = todos
    this.doing = doing
    this.done = done
  }

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

@app.model(
  "/board/todos/:index",
  "/board/doing/:index",
  "/board/done/:index",
)
class Todo {
  constructor({ title, description, status = "todo" }) {
    this.title = title
    this.description = description
    this.status = status
  }

  finish() {
    this.status = "done"
  }

  start() {
    this.status = "doing"
  }
}

@app.model("/users/:index")
class User {
  constructor({ firstName, lastName }) {
    this.firstName = firstName
    this.lastName = lastName
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }
}
```

### @app.inject: Injecting portions of the Tree into a React Component

**Provided by** `arbor-react`

```jsx
@app.inject("/users", "/board")
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
```

```jsx
@app.inject("/users")
class UsersView extends React.Component {
  render() {
    const users = this.state.users.map(user => (
      <li key={user.id}>{user.fullName}</li>
    ))

    return (
      <div>
        <ul>
          {users}
        </ul>
      </div>
    )
  }
}
```

Use `HOC` to timplement `@app.inject`:

```js
const inject = (...paths) => (Component) {
  return class extends React.Component {
    render() {
      const parsedPaths = paths.map(path => Path.parse(path))
      const injected = parsedPaths.reduce((injected, path) => {
        const value = path.traverse(app.state)
        const propName = path.nodes.pop()
        injected[propName] = value
        return injected
      })

      return <Component {...this.props} {...injected} />
    }
  }
}
```

### arbor-timetravel Package

Provides state timetravel functionality.

```js
import withTimetravel from "arbor-timetravel"

const appWithTimetravel = withTimetravel(new Tree)
appWithTimetravel.back(2)
appWithTimetravel.forward(1)
```
