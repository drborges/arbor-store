import Path from "./path"
import PubSub from "./pubsub"
import createNode from "./nodes"
import Model, { Registry } from "./model"

const mutate = (mutationPath, mutation, parent) => {
  const childPath = mutationPath.subpath(parent.$path.depth + 1)
  const childProp = childPath.leaf

  return childPath.match(mutationPath) ?
    mutation(parent, childProp) :
    mutate(mutationPath, mutation, parent.$refreshChild(childProp))
}

export default class Arbor {
  constructor(state = {}) {
    this.pubsub = new PubSub
    this.models = new Registry
    this.nodes = new WeakMap
    this.mutationTarget = null
    this.root = this.create(new Path, state)
  }

  subscribe(path, subscriber) {
    if (typeof path === "function") {
      subscriber = path
      path = Path.root
    }

    const resolvedPath = Path.resolve(path)
    const unsubscribe = this.pubsub.subscribe(resolvedPath, subscriber)

    if (path === Path.root) {
      this.pubsub.publish(resolvedPath, this.root)
    }

    return unsubscribe
  }

  create(path, value) {
    const node = createNode(this, path, value)
    return this.wrapped(new Proxy(value, node))
  }

  restore(newRoot) {
    const oldRoot = this.root
    this.root = newRoot
    this.pubsub.publish(Path.root, newRoot, oldRoot)
  }

  wrapped(proxy) {
    const Type = this.models && this.models.fetch(proxy.$path)
    return Type ? new Proxy(proxy, new Type(proxy)) : proxy
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
    if (this.mutationTarget) {
      throw new TypeError(`Mutation already in progress at ${this.mutationTarget.$path.toSting()}`)
    }

    const oldRoot = this.root
    const newRoot = this.root.$copy()
    const mutatedNode = mutate(mutationPath, mutation, newRoot)
    this.root = newRoot
    this.pubsub.publish(mutationPath, newRoot, oldRoot)
    return mutatedNode
  }

  get state() {
    return this.root
  }

  set state(rootValue) {
    if (rootValue.constructor === Promise) {
      this.root = this.create(new Path, {})
      rootValue.then(state => this.restore(this.create(new Path, state)))
    } else {
      this.root = this.create(new Path, rootValue)
    }
  }
}
