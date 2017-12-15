import Path from "./path"
import Pubsub from "./pubsub"
import Mutator from "./mutator"
import { NodeObject, NodeArray } from "./node"

class NodeWrapper {
  registry = {}

  for(path) {
    const registeredPaths = Object.keys(this.registry)
    const registeredPath = registeredPaths.find(registeredPath => path.match(registeredPath))
    return this.registry[registeredPath]
  }

  register(path, Type) {
    const regexPath = path.toString().replace(":index", "\\d+")
    this.registry[regexPath] = Type
  }
}

export default class Tree {
  constructor(initialState, { pubsub = new Pubsub, mutator = new Mutator, wrapper = new NodeWrapper } = {}) {
    this.wrapper = wrapper
    this.pubsub = pubsub
    this.mutator = mutator
    this.root = this.create(Path.root, initialState)
  }

  get(path) {
    return Path.resolve(path).traverse(this.root)
  }

  create(path, value, children = {}) {
    const node = Array.isArray(value) ?
      new NodeArray(this, path, value, children) :
      new NodeObject(this, path, value, children)

    return this.wrapped(node)
  }

  wrapped(proxy) {
    const Wrapper = this.wrapper.for(proxy.$path)
    return Wrapper ? new Wrapper(proxy) : proxy
  }

  register(path, Type) {
    this.wrapper.register(path, Type)
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
