import Cache from "./cache"

const isLeafNode = (value) =>
  value === undefined ||
  value === null ||
  value.constructor !== Object &&
  value.constructor !== Array

/**
 * Unpacks the proxied value if necessary
 */
const unpack = (value) => value && value.$value !== undefined ?
  value.$unpack() :
  value

const mutations = {
  set: (value) => (node, prop) => {
    node.$value[prop] = unpack(value)
  },

  transaction: (fn) => (node, prop) => {
    const child = node.$refreshChild(prop)
    node.$tree.transactions.push(child)
    fn(child)
    node.$tree.transactions.pop()
  }
}

export default class Node {
  constructor(tree, path, value, children = new Cache) {
    if (this.constructor === Node) {
      throw new TypeError("Node is an abstract class and must be subclassed")
    }

    this.$tree = tree
    this.$path = path
    this.$value = value
    this.$children = children
  }

  get(target, prop) {
    const value = target[prop]

    if (this[prop]) {
      return this[prop]
    }

    if (isLeafNode(value)) {
      return value
    }

    if (!this.$children.has(value)) {
      this.$children.set(value, this.$proxify(prop, value))
    }

    return this.$children.get(value)
  }

  set(target, prop, value) {
    this.$tree.mutate(this.$path.child(prop), mutations.set(value))
    return true
  }

  $transaction(fn) {
    this.$tree.mutate(this.$path, mutations.transaction(fn))
    return this.$path.traverse(this.$tree.root)
  }

  $refresh() {
    this.$children.clear()
    return this
  }

  $refreshChild(prop) {
    const child = this[prop].$copy()
    this.$value[prop] = child.$value
    this.$children.set(child.$value, child)
    return child
  }

  $proxify(prop, value) {
    return this.$tree.create(this.$path.child(prop), value)
  }

  $copy() {
    return this.$tree.create(this.$path, this.$unpack(), this.$children)
  }

  get $transactionPath() {
    return this.$path.child(".*")
  }
}
