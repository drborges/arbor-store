import Node from "./node"

export default class ArrayNode extends Node {
  fill(item, start, end) {
    this.$mutate(array => array.fill(item, start, end))
    return this.$refresh()
  }

  sort(compare) {
    this.$mutate(array => array.sort(compare))
    return this.$refresh()
  }

  splice(start, count, ...items) {
    return this.$mutate(array => array.splice(start, count, ...items))
  }

  copyWithin(target, start, end) {
    this.$mutate(array => array.copyWithin(target, start, end))
    return this.$refresh()
  }

  shift() {
    return this.$mutate(array => array.shift())
  }

  unshift(item) {
    return this.$mutate(array => array.unshift(item))
  }

  reverse() {
    return this.$mutate(array => array.reverse())
  }

  $unpack() {
    return [ ...this.$value ]
  }
}
