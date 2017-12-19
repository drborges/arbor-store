import Tree, { Path, create } from "./ptree"
import connect from "./react/connect"
import timetravel from "./timetravel"

export {
  timetravel,
  connect,
  Tree,
}

export default class Store {
  constructor(initialState = {}) {
    this.tree = new Tree(initialState)
  }

  set(state) {
    if (state.constructor === Promise) {
      state.then(value => {
        this.tree.root = this.tree.create(Path.root, value)
        this.tree.pubsub.publish(Path.root, this.tree.root)
      })
    } else {
      this.tree.root = this.tree.create(Path.root, state)
      this.tree.pubsub.publish(Path.root, this.tree.root)
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
