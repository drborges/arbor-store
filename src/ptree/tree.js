import Path from "./path"
import Pubsub from "./pubsub"
import Mutator from "./mutator"
import { NodeObject, NodeArray } from "./node"

export default class Tree {
  constructor(initialState) {
    this.root = this.create(Path.root, initialState)
    this.pubsub = new Pubsub
    this.mutator = new Mutator(this)
  }

  get(path) {
    return Path.resolve(path).traverse(this.root)
  }

  mutate(path, mutation) {
    this.root = this.root.copy()
    this.mutator.apply(mutation, Path.resolve(path), this.root)
  }

  create(path, value, children = {}) {
    return Array.isArray(value) ?
      new NodeArray(this, path, value, children) :
      new NodeObject(this, path, value, children)
  }

  subscribe(path, subscriber) {
    return this.pubsub.subscribe(path, subscriber)
  }
}
