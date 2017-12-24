import Path from "./path"
import Pubsub from "./pubsub"
import Mutator from "./mutator"
import { NodeObject, NodeArray } from "./node"

export default class Tree {
  constructor(initialState, { pubsub = new Pubsub, mutator = new Mutator } = {}) {
    this.pubsub = pubsub
    this.mutator = mutator
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
    this.root = this.root.copy()
    this.mutator.mutate(Path.resolve(path), mutation, this.root)
    this.pubsub.publish(Path.root, this.root)
  }

  subscribe(path, subscriber) {
    return this.pubsub.subscribe(path, subscriber)
  }
}
