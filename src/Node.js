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

  get(target, prop, receiver) {
    const proxyHandlerValue = Reflect.get(this, prop, receiver)

    if (proxyHandlerValue !== undefined) {
      return proxyHandlerValue
    }

    const targetValue = Reflect.get(target, prop, receiver)
    if (!this.$tree.canProxify(targetValue)) {
      return targetValue
    }

    if (!this.$tree.has(targetValue)) {
      this.$tree.add(this.$path.child(prop), targetValue)
    }

    return this.$tree.get(targetValue)
  }

  set(target, prop, value, receiver) {
    this.$tree.mutate(this.$path, (node) => {
      node.$value[prop] = value
    })

    return true
  }
}
