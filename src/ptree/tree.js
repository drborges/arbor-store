import Path from "./path"
import Pubsub from "./pubsub"
import Mutator from "./mutator"
import { create } from "./node"

export default class Tree {
  constructor(initialState) {
    this.root = create(this, Path.root, initialState)
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

  subscribe(path = Path.root, subscriber) {
    return this.pubsub.subscribe(path, subscriber)
  }
}
