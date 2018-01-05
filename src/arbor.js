import { Path } from "./ptree"
import Model from "./mtree/model"
import Registry from "./mtree/registry"

/**
 * Unpacks the proxied value if necessary
 */
const unpack = (value) => value.$value !== undefined ?
  value.unpack() :
  value

const mutations = {
  set: (value) => (node, prop) => {
    node.$value[prop] = unpack(value)
  },

  transaction: (fn) => (node, prop) => {
    const child = node.refresh(prop)
    node.$tree.transactionNode = child
    fn(child)
    node.$tree.transactionNode = null
  }
}

const isLeafNode = (value) =>
  value === undefined ||
  value === null ||
  value.constructor !== Object &&
  value.constructor !== Array

export class Node {
  constructor(tree, path, value) {
    this.$tree = tree
    this.$path = path
    this.$value = value
  }

  get(target, prop) {
    const value = target[prop]

    if (this[prop]) {
      return this[prop]
    }

    if (isLeafNode(value)) {
      return value
    }

    if (!this.$tree.nodes.has(value)) {
      this.$tree.create(this.$path.child(prop), value)
    }

    return this.$tree.nodes.get(value)
  }

  set(target, prop, value) {
    this.$tree.mutate(this.$path.child(prop), mutations.set(value))

    return true
  }

  transaction(fn) {
    this.$tree.mutate(this.$path, mutations.transaction(fn))
  }

  refresh(prop) {
    const child = this[prop].copy()
    this.$value[prop] = child.$value
    return child
  }

  copy() {
    return this.$tree.create(this.$path, this.unpack())
  }
}

export class ObjectNode extends Node {
  unpack() {
    return { ...this.$value }
  }
}

export class ArrayNode extends Node {
  unpack() {
    return [ ...this.$value ]
  }
}

export default class Arbor {
  constructor(state) {
    this.nodes = new WeakMap
    this.models = new Registry
    this.root = this.create(new Path, state)
  }

  create(path, value) {
    const node = Array.isArray(value) ?
      new ArrayNode(this, path, value) :
      new ObjectNode(this, path, value)

    const proxy = this.wrapped(new Proxy(value, node))
    this.nodes.set(value, proxy)
    return proxy
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
    if (this.transactionNode) {
      this.applyMutation(mutationPath, mutation, this.transactionNode)
    } else {
      const root = this.root.copy()
      this.applyMutation(mutationPath, mutation, root)
      this.root = root
    }
  }

  applyMutation(mutationPath, mutation, parent) {
    const childPath = mutationPath.subpath(parent.$path.depth + 1)
    const childProp = childPath.leaf

    if (childPath.match(mutationPath)) {
      mutation(parent, childProp)

    } else {
      const child = parent.refresh(childProp)
      this.applyMutation(mutationPath, mutation, child)
    }
  }
}
