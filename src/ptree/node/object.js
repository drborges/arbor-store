import Node from "./node"

export default class NodeObject extends Node {
  constructor($tree, $path, value, $children = {}) {
    super($tree, $path, value, $children)
    return new Proxy(value, this)
  }

  copy = () => this.$tree.create(
    this.$path,
    { ...this.$value },
    { ...this.$children },
  )
}
