import Path from "./Path"
import PubSub from "./PubSub"
import NodeFactory from "./NodeFactory"
import TypeRegistry from "./TypeRegistry"

class NodeCache {
  byPath = new WeakMap
  byValue = new WeakMap

  set(value, node) {
    this.byPath.set(node.$path, node)
    this.byValue.set(value, node)
  }
}

class Transactions {
  mutationPoints = []

  start(node) {
    this.mutationPoints.push(node)
  }

  commit() {
    return this.mutationPoints.pop()
  }

  current() {
    return this.mutationPoints[this.mutationPoints.length-1]
  }

  empty() {
    return this.mutationPoints.length === 0
  }
}

export default class Arbor {
  constructor(state = {}) {
    this.nodes = new NodeCache
    this.types = new TypeRegistry
    this.subscriptions = new PubSub
    this.transactions = new Transactions
    this.nodeFactory = new NodeFactory(this)
    this.root = this.add(Path.root, state)
  }

  add(path, value) {
    const Type = this.types.fetch(path)
    const wrapped = Type ? new Type(value) : value
    const node = this.nodeFactory.create(path, wrapped)

    this.nodes.set(value, node)

    return node
  }

  bind(path, Type) {
    this.types.register(path, Type)
  }

  mutate(path, mutation) {
    const nextState = this.transactions.current() || this.root.$copy
    const mutationPath = nextState.$path.complement(path)
    const targetNode = mutationPath.walk(nextState)

    this.transactions.start(targetNode)
    const result = mutation(targetNode)
    this.transactions.commit()

    if (this.transactions.empty()) {
      const previousState = this.root
      this.root = nextState
      this.subscriptions.notify(nextState, previousState)
    }

    return result
  }

  canProxify(value) {
    return value !== undefined && value !== null && (
      value.constructor === Object ||
      value.constructor === Array
    )
  }

  subscribe(subscriber) {
    this.subscriptions.subscribe(subscriber)
    return () => {
      this.subscriptions.unsubscribe(subscriber)
    }
  }

  get state() {
    return this.root
  }
}
