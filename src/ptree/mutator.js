import Path from "./path"

class Mutator {
  mutate(mutation, mutationPath, node) {
    const childPath = mutationPath.subpath(node.$path.depth + 1)
    const childProp = childPath.leaf

    if (childPath.match(mutationPath)) {
      mutation(node, childProp)

    } else {
      const child = node.$children[childProp]
      // Make sure only nodes affected by the mutation are refreshed. This allows
      // libs such as React to make reference comparissons between objects in
      // order to determine whether a mutation has happened and thus allowing the
      // UI to be rerendered in an optimal fashion.
      const refreshedChild = node.$children[childProp] = child.copy()
      // Make sure proxies are wrapping up-to-date data
      node.$value[childProp] = refreshedChild.$value
      this.mutate(mutation, mutationPath, refreshedChild)
    }
  }
}

export default Mutator
