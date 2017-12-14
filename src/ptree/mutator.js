import Path from "./path"

class Mutator {
  constructor(tree) {
    this.tree = tree
  }

  apply(mutation, mutationPath, parent) {
    const childPath = mutationPath.subpath(parent.$path.depth)
    const childProp = childPath.leaf
    const child = parent.$children[childProp]

    if (childPath.match(mutationPath)) {
      mutation(parent, childProp)
      this.tree.pubsub.publish(Path.root, this.tree.root)

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
}

export default Mutator
