import cached from "./cached"

@cached((...nodes) => nodes.toString())
export default class Path {
  static root = new Path

  static parse = (str) => {
    const nodes = str.split("/").slice(1)
    return new Path(...nodes)
  }

  static resolve = (path) => {
    return path.constructor === String ?
    Path.parse(path) :
    path
  }

  constructor(...nodes) {
    this.nodes = nodes
  }

  child(node) {
    return new Path(...[...this.nodes, node])
  }

  match(path) {
    const pattern = new RegExp(`^${path.toString()}$`)
    return pattern.test(this.toString())
  }

  traverse(obj) {
    return this.nodes.reduce((data, node) => data[node], obj)
  }

  toString() {
    return `/${this.nodes.join("/")}`
  }

  subpath(depth = 0) {
    return new Path(...this.nodes.slice(0, depth+1))
  }

  get leaf() {
    return this.nodes[this.nodes.length - 1]
  }

  get depth() {
    return this.nodes.length
  }

  *[Symbol.iterator]() {
    for (const node of this.nodes) {
      yield node
    }
  }
}
