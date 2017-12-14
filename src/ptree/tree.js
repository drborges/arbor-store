import Path from "./path"
import Pubsub from "./pubsub"
import { create } from "./node"

export default class Tree {
  constructor(initialState) {
    this.root = create(this, Path.root, initialState)
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
      const childCopy = child.copy()
      // Make sure only nodes affected by the mutation are refreshed. This allows
      // libs such as React to make reference comparissons between objects in
      // order to determine whether a mutation has happened and thus allowing the
      // UI to be rerendered in an optimal fashion.
      const refreshedChild = parent.$children[childProp] = childCopy
      // Make sure proxies are wrapping up-to-date data
      parent.$value[childProp] = childCopy.$value
      this.apply(mutation, mutationPath, refreshedChild)
    }
  }

  subscribe(path = Path.root, subscriber) {
    return this.pubsub.subscribe(path, subscriber)
  }
}
