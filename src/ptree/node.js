import mutations from "./mutations"

const isMutationMethod = (prop) => Object.keys(mutations).includes(prop)

export default class Node {
  constructor($tree, $path, value, $children = {}) {
    this.$tree = $tree
    this.$path = $path
    this.$value = value
    this.$children = $children
    this.$proxy = new Proxy(value, this)
    return this.$proxy
  }

  get(target, prop) {
    if (this.hasOwnProperty(prop)) {
      return isMutationMethod(prop) ?
        this[prop](this.$path.child(prop)) :
        this[prop]
    }

    if (!target.hasOwnProperty(prop)) {
      return undefined
    }

    const childPath = this.$path.child(prop)
    const value = target[prop]

    if (value.constructor !== Object && value.constructor !== Array) {
      return target[prop]
    }

    if (!this.$children[prop]) {
      this.$children[prop] = new Node(this.$tree, childPath, value)
    }

    return this.$children[prop]
  }

  set(target, prop, value) {
    const path = this.$path.child(prop)
    this.$tree.mutate(path, mutations.set(value))

    return true
  }

  push = (path) => (item) => {
    this.$tree.mutate(path, mutations.push(item))
  }

  splice = (path) => (start, removeCount, ...newItems) => {
    const removed = this.$value.slice(start, removeCount)
    this.$tree.mutate(path, mutations.splice(start, removeCount, newItems))
    return removed
  }

  map = (fn) => this.$value.map((_, i) => {
    return fn(this.get(this.$value, i), i, this.$proxy)
  })

  copy = () => new Node(
    this.$tree,
    this.$path,
    Array.isArray(this.$value) ? [ ...this.$value ] : {...this.$value},
    { ...this.$children },
  )
}
