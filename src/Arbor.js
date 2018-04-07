import Path from "./Path"
import PubSub from "./PubSub"
import NodeFactory from "./NodeFactory"
import TypeRegistry from "./TypeRegistry"

export default class Arbor {
  constructor(state = {}) {
    this.nodes = new WeakMap
    this.types = new TypeRegistry
    this.subscriptions = new PubSub
    this.nodeFactory = new NodeFactory(this)
    this.root = this.add(Path.root, state)
  }

  has(value) {
    return this.nodes.has(value)
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

  get(value) {
    return this.nodes.get(value)
  }

  mutate(mutationPath, mutation) {
    const previousStateRoot = this.root
    const nextStateRoot = this.root.$copy
    const targetNode = mutationPath.walk(nextStateRoot)
    const result = mutation(targetNode)

    this.root = nextStateRoot
    this.subscriptions.notify(nextStateRoot, previousStateRoot)

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
