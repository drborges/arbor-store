import Path from "./path"
import Stack from "./stack"
import PubSub from "./pubsub"
import createNode from "./nodes"
import Model, { Registry } from "./model"

const mutate = (mutationPath, mutation, parent) => {
  const childPath = mutationPath.subpath(parent.$path.depth + 1)
  const childProp = childPath.leaf

  if (childPath.match(mutationPath)) {
    mutation(parent, childProp)
  } else {
    mutate(mutationPath, mutation, parent.$refreshChild(childProp))
  }
}

export default class Arbor {
  constructor(state) {
    this.pubsub = new PubSub
    this.models = new Registry
    this.transactions = new Stack
    this.root = this.create(new Path, state)
  }

  subscribe(path, subscriber) {
    return this.pubsub.subscribe(path, subscriber)
  }

  create(path, value, children) {
    const node = createNode(this, path, value, children)
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
    const node = this.transactions.peek()

    if (node) {
      const transactionPath = node.$transactionPath
      if (!mutationPath.match(transactionPath)) {
        throw new TypeError(`Mutation path ${mutationPath.toString()} does not belong to transaction path ${transactionPath.toString()}`)
      }

      mutate(mutationPath, mutation, node)
    } else {
      const oldRoot = this.root
      const newRoot = this.root.$copy()
      mutate(mutationPath, mutation, newRoot)
      this.root = newRoot
      this.pubsub.publish(mutationPath, newRoot, oldRoot)
    }
  }

  get state() {
    return this.root
  }
}
