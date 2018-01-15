import Node from "./node"

export default class ArrayNode extends Node {
  fill(item, start, end) {
    return this.$transaction(array => {
      array.$value.fill(item, start, end)
      return array
    })
  }

  sort(compare) {
    return this.$transaction(array => {
      array.$value.sort(compare)
      return array
    })
  }

  splice(start, count, ...items) {
    return this.$transaction(array => array.$value.splice(start, count, ...items))
  }

  copyWithin(target, start, end) {
    return this.$transaction(array => {
      array.$value.copyWithin(target, start, end)
      return array
    })
  }

  shift() {
    return this.$transaction(array => array.$value.shift())
  }

  unshift(item) {
    return this.$transaction(array => array.$value.unshift(item))
  }

  reverse() {
    return this.$transaction(array => array.$value.reverse())
  }

  $unpack() {
    return [ ...this.$value ]
  }
}
