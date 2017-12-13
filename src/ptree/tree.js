import Path from "./path"
import Node from "./node"
import Pubsub from "./pubsub"

export default class Tree {
  constructor(initialState) {
    this.root = new Node(this, Path.root, initialState)
    this.pubsub = new Pubsub
  }

  get(path) {
    return Path.resolve(path).traverse(this.root)
  }

  mutate(path, mutation) {
    this.root = this.root.copy()
    this.apply(mutation, Path.resolve(path), this.root)
  }

  apply(mutation, mutationPath, parent) {
    const childPath = mutationPath.subpath(parent.$path.depth)
    const childProp = childPath.leaf
    const child = parent.$children[childProp]

    if (childPath.match(mutationPath)) {
      mutation(parent, childProp)
      this.pubsub.publish(Path.root, this.root)

    } else {
      const refreshedChild = parent.$children[childProp] = child.copy()
      this.apply(mutation, mutationPath, refreshedChild)
    }
  }

  subscribe(path = Path.root, subscriber) {
    return this.pubsub.subscribe(path, subscriber)
  }
}
