import Node from "./node"
import create from "./create"

export default class NodeObject extends Node {
  constructor($tree, $path, value, $children = {}) {
    super($tree, $path, value, $children)
    return this.$proxy = new Proxy(value, this)
  }

  copy = () => create(
    this.$tree,
    this.$path,
    { ...this.$value },
    { ...this.$children },
  )
}
