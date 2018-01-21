import { proxiable, mutations } from "./utils"

export default class Node {
  constructor(tree, path, value) {
    if (this.constructor === Node) {
      throw new TypeError("Node is an abstract class and must be subclassed")
    }

    this.$tree = tree
    this.$path = path
    this.$value = value
  }

  get(target, prop) {
    const nodeValue = Reflect.get(this, prop)

    if (nodeValue !== undefined) {
      return nodeValue
    }

    const targetValue = Reflect.get(target, prop)

    if (!proxiable(targetValue)) {
      return targetValue
    }

    const childPath = this.$path.child(prop)

    if (!this.$tree.nodes.has(targetValue)) {
      const child = this.$tree.create(childPath, targetValue)
      this.$tree.nodes.set(targetValue, child)
    }

    const child = this.$tree.nodes.get(targetValue)
    child.$path = childPath
    return child
  }

  set(target, prop, value) {
    if (prop === "$path") {
      this.$path = value
    } else {
      this.$tree.mutate(this.$path.child(prop), mutations.set(value))
    }

    return true
  }

  $mutate(fn) {
    return this.$tree.mutate(this.$path, mutations.mutate(fn))
  }

  $refreshChild(prop) {
    const child = this[prop].$copy()
    this.$value[prop] = child.$value
    this.$tree.nodes.set(child.$value, child)
    return child
  }

  $copy() {
    return this.$tree.create(this.$path, this.$unpack())
  }

  $refresh() {
    return this.$path.traverse(this.$tree.root)
  }
}
