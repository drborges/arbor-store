import Tree, { Path } from "./ptree"

export { Tree, Path }
export connect from "./react/connect"
export timetravel from "./timetravel"

export default class Store {
  constructor(initialState = {}) {
    this.tree = new Tree(initialState)
  }

  set(state) {
    if (state.constructor === Promise) {
      state.then(value => this.tree.setRoot(value))
      return
    }

    this.tree.setRoot(state)
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
