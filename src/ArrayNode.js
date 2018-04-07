import Node from "./Node"

export default class ArrayNode extends Node {
  constructor(tree, path, node) {
    super(tree, path, node)
  }

  copyWithin(target, start, end) {
    return this.$tree.mutate(this.$path, node => {
      const value = node.$value
      value.copyWithin(target, start, end)
      return this.$tree.get(value)
    })
  }

  pop() {
    return this.$tree.mutate(this.$path, node => node.$value.pop())
  }

  reverse() {
    return this.$tree.mutate(this.$path, node => {
      const value = node.$value
      value.reverse()
      return this.$tree.get(value)
    })
  }

  shift() {
    return this.$tree.mutate(this.$path, node => node.$value.shift())
  }

  sort(fn) {
    return this.$tree.mutate(this.$path, node => {
      const value = node.$value
      value.sort(fn)
      return this.$tree.get(value)
    })
  }

  splice(start, count, ...items) {
    return this.$tree.mutate(this.$path, node => node.$value.splice(start, count, ...items))
  }

  unshift(...items) {
    return this.$tree.mutate(this.$path, node => node.$value.unshift(...items))
  }

  get $copy() {
    return this.$tree.add(this.$path, [ ...this.$value ])
  }
}
