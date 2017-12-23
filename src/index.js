import Tree, { Path } from "./ptree"

export connect from "./react/connect"
export timetravel from "./timetravel"

export default class Store {
  constructor(initialState = {}, { Engine = Tree } = {}) {
    this.tree = new Engine({})

    if (initialState.constructor === Promise) {
      initialState.then(value => this.tree.setRoot(value))
    } else {
      this.tree.setRoot(initialState)
    }
  }

  subscribe(path, subscriber) {
    if (arguments.length === 1) {
      path = Path.root
      subscriber = arguments[0]
    }

    return this.tree.subscribe(path, subscriber)
  }

  get state() {
    return this.tree.root
  }
}
