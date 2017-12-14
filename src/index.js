import Tree, { Path } from "./ptree"
import connect from "./react/connect"

export { Tree }
export { connect }

export default class Store {
  constructor(initialState) {
    this.tree = new Tree(initialState)
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
