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

  sort = (path) => (compare) => {
    this.$tree.mutate(path, mutations.sort(compare))
    return this.$tree.get(path.parent)
  }

  copyWithin = (path) => (target, start, end) => {
    this.$tree.mutate(path, mutations.copyWithin(target, start, end))
    return this.$tree.get(path.parent)
  }

  reverse = (path) => () => {
    this.$tree.mutate(path, mutations.reverse())
    return this.$tree.get(path.parent)
  }

  shift = (path) => () => {
    const shifted = this.$value[0]
    this.$tree.mutate(path, mutations.shift())
    return shifted
  }

  copy = () => create(
    this.$tree,
    this.$path,
    [ ...this.$value ],
    { ...this.$children },
  )
}
