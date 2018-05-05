import Path from "./Path"

export default class Node {
  constructor(tree, path, value) {
    this.$tree = tree
    this.$path = path
    this.$value = value
  }

  get $copy() {
    throw "Abstract method: Must be implemented by subclasses"
  }

  get $refreshed() {
    return this.$tree.nodes.byPath.get(this.$path)
  }

  $mutate(fn) {
    return this.$tree.mutate(this.$path, fn)
  }

  get(target, prop, receiver) {
    const proxyHandlerValue = Reflect.get(this, prop, receiver)

    if (proxyHandlerValue !== undefined) {
      return proxyHandlerValue
    }

    if (!this.$tree.transactions.empty()) {
      target = this.$refreshed.$value
    }

    const childValue  = Reflect.get(target, prop, receiver)

    if (!this.$tree.canProxify(childValue)) {
      return childValue
    }

    const childPath = this.$path.child(prop)

    if (!this.$tree.nodes.byValue.has(childValue)) {
      this.$tree.add(childPath, childValue)
    }

    const child = this.$tree.nodes.byValue.get(childValue)
    child.$path = childPath
    return child
  }

  set(target, prop, value, receiver) {
    if (prop === "$path") {
      this.$path = value
      return true
    }

    this.$tree.mutate(this.$path, (node) => {
      node.$value[prop] = value
    })

    return true
  }
}
