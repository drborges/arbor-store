import { Path } from "./ptree"
import Model from "./mtree/model"
import Registry from "./mtree/registry"

class Stack {
  items = []

  push(item) {
    this.items.push(item)
  }

  pop() {
    return this.items.pop()
  }

  clear() {
    this.items = []
  }

  peek() {
    return this.items.slice(-1)[0]
  }

  get length() {
    return this.items.length
  }
}

class Cache {
  items = new WeakMap

  set(key, value) {
    this.items.set(key, value)
  }

  get(key) {
    return this.items.get(key)
  }

  has(key) {
    return this.items.has(key)
  }

  delete(key) {
    return this.items.delete(key)
  }

  clear() {
    this.items = new WeakMap
  }
}

/**
 * Unpacks the proxied value if necessary
 */
const unpack = (value) => value.$value !== undefined ?
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

const isLeafNode = (value) =>
  value === undefined ||
  value === null ||
  value.constructor !== Object &&
  value.constructor !== Array

const mutate = (mutationPath, mutation, parent) => {
  const childPath = mutationPath.subpath(parent.$path.depth + 1)
  const childProp = childPath.leaf

  if (childPath.match(mutationPath)) {
    mutation(parent, childProp)

  } else {
    const child = parent.$refreshChild(childProp)
    mutate(mutationPath, mutation, child)
  }
}

export class Node {
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
      this.$createChild(prop, value)
    }

    return this.$children.get(value)
  }

  set(target, prop, value) {
    this.$tree.mutate(this.$path.child(prop), mutations.set(value))

    return true
  }

  $transaction(fn) {
    this.$tree.mutate(this.$path, mutations.transaction(fn))
    return this.$tree.get(this.$path)
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

  $createChild(prop, value) {
    const proxy = this.$tree.create(this.$path.child(prop), value)
    this.$children.set(value, proxy)
  }

  $copy() {
    return this.$tree.create(this.$path, this.$unpack(), this.$children)
  }

  get $transactionPath() {
    return this.$path.child(".*")
  }
}

export class ObjectNode extends Node {
  $unpack() {
    return { ...this.$value }
  }
}

export class ArrayNode extends Node {
  sort(compare) {
    return this.$transaction(array => array.$refresh().$value.sort(compare))
  }

  splice(start, count, ...items) {
    let removed

    this.$transaction(array => {
      removed = array.$refresh().$value.splice(start, count, ...items)
    })

    return removed
  }

  $unpack() {
    return [ ...this.$value ]
  }
}

export default class Arbor {
  constructor(state) {
    this.transactions = new Stack
    this.models = new Registry
    this.root = this.create(new Path, state)
  }

  get(path) {
    return path.traverse(this.root)
  }

  create(path, value, children) {
    const node = Array.isArray(value) ?
      new ArrayNode(this, path, value, children) :
      new ObjectNode(this, path, value, children)

    return this.wrapped(new Proxy(value, node))
  }

  wrapped(proxy) {
    const Model = this.models && this.models.fetch(proxy.$path)
    return Model ? new Model(proxy) : proxy
  }

  bind(Type) {
    const model = Model(Type)
    return {
      to: (...paths) => {
        paths.forEach(path => this.models.register(path, model))
      }
    }
  }

  mutate(mutationPath, mutation) {
    const node = this.transactions.peek()

    if (node) {
      if (!mutationPath.match(node.$transactionPath)) {
        throw new TypeError("Mutation path does not belong to transaction subtree")
      }

      mutate(mutationPath, mutation, node)
    } else {
      const root = this.root.$copy()
      mutate(mutationPath, mutation, root)
      this.root = root
    }
  }
}
