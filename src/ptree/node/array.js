import Node from "./node"
import mutations from "../mutations"

export default class NodeArray extends Node {
  constructor($tree, $path, $value, $children = {}) {
    super($tree, $path, $value, $children)
    return new Proxy($value, this)
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

  unshift = (path) => (...items) => {
    this.$tree.mutate(path, mutations.unshift(items))
    return this.$tree.get(path.parent).$value.length
  }

  copy = () => this.$tree.create(
    this.$path,
    [ ...this.$value ],
    { ...this.$children },
  )
}
