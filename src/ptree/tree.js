import Path from "./path"
import Pubsub from "./pubsub"
import Mutator from "./mutator"
import { NodeObject, NodeArray } from "./node"

export default class Tree {
  constructor(initialState, { pubsub = new Pubsub, mutator = new Mutator } = {}) {
    this.pubsub = pubsub
    this.mutator = mutator
    this.transactionNode = null
    this.root = this.create(Path.root, initialState)
  }

  get(path) {
    return Path.resolve(path).traverse(this.root)
  }

  create(path, value, children = {}) {
    return Array.isArray(value) ?
      new NodeArray(this, path, value, children) :
      new NodeObject(this, path, value, children)
  }

  setRoot(value) {
    this.root = this.create(Path.root, value)
    this.pubsub.publish(Path.root, this.root)
  }

  mutate(path, mutation) {
    if (this.transactionNode) {
      this.mutateWithinTransaction(path, mutation)
    } else {
      this.mutateAndPublish(path, mutation)
    }
  }

  mutateWithinTransaction(path, mutation) {
    const transactionPath = this.transactionNode.$path.child(".*")

    if (!path.match(transactionPath)) {
      throw "Cannot mutate node outside transaction path"
    }

    this.mutator.mutate(path, mutation, this.transactionNode)
  }

  mutateAndPublish(path, mutation) {
    const root = this.root.copy()
    this.mutator.mutate(path, mutation, root)
    this.root = root
    this.pubsub.publish(Path.root, this.root)
  }

  subscribe(path, subscriber) {
    return this.pubsub.subscribe(path, subscriber)
  }
}
