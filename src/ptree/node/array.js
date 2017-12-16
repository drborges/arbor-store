import Node from "./node"
import create from "./create"
import mutations from "../mutations"

export default class NodeArray extends Node {
  constructor($tree, $path, value, $children = {}) {
    super($tree, $path, value, $children)
    return this.$proxy = new Proxy(value, this)
  }

  splice = (path) => (start, removeCount, ...newItems) => {
    const removed = this.$value.slice(start, removeCount)
    this.$tree.mutate(path, mutations.splice(start, removeCount, newItems))
    return removed
  }

  copy = () => create(
    this.$tree,
    this.$path,
    [ ...this.$value ],
    { ...this.$children },
  )
}
