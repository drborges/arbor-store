const proxiable = (value) =>
  value !== undefined &&
  value !== null && (
    value.constructor === Object ||
    value.constructor === Array
  )

const createMutator = (data) => new Proxy(data, {
  $unpack() {
    return data
  },

  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver)

    if (typeof value === "function") {
      return value.bind(target)
    }

    if (!proxiable(value)) {
      return value
    }

    target[prop] = Array.isArray(value) ?
      [...value] :
      {...value}

    return createMutator(target[prop])
  },

  set(target, prop, value) {
    target[prop] = unpack(value)
    return true
  }
})

/**
 * Unpacks the proxied value if necessary
 */
const unpack = (value) => value && value.$value !== undefined ?
  value.$unpack() :
  value

const mutations = {
  set: (value) => (node, prop) => {
    node.$value[prop] = unpack(value)
    return node
  },

  transaction: (fn) => (node, prop) => {
    node.$tree.transactions.push(node[prop])
    const mutator = createMutator(node.$value)
    const result = fn(createMutator(mutator[prop]))
    node.$tree.transactions.pop()
    return result
  }
}

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
    const targetValue = Reflect.get(target, prop)
    const nodeValue = Reflect.get(this, prop)

    if (nodeValue !== undefined) {
      return nodeValue
    }

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
    if (this[prop]) {
      this[prop] = value
    } else {
      this.$tree.mutate(this.$path.child(prop), mutations.set(value))
    }

    return true
  }

  $transaction(fn) {
    return this.$tree.mutate(this.$path, mutations.transaction(fn))
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

  get $transactionPath() {
    return this.$path.child(".*")
  }
}
