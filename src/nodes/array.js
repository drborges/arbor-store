import Node from "./node"

export default class ArrayNode extends Node {
  fill(item, start, end) {
    this.$transaction(array => array.fill(item, start, end))
    return this.$refresh()
  }

  sort(compare) {
    this.$transaction(array => array.sort(compare))
    return this.$refresh()
  }

  splice(start, count, ...items) {
    return this.$transaction(array => array.splice(start, count, ...items))
  }

  copyWithin(target, start, end) {
    this.$transaction(array => array.copyWithin(target, start, end))
    return this.$refresh()
  }

  shift() {
    return this.$transaction(array => array.shift())
  }

  unshift(item) {
    return this.$transaction(array => array.unshift(item))
  }

  reverse() {
    return this.$transaction(array => array.reverse())
  }

  $unpack() {
    return [ ...this.$value ]
  }
}
