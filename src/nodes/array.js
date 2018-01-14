import Node from "./node"

export default class ArrayNode extends Node {
  fill(item, start, end) {
    return this.$transaction(array => {
      array.$value.fill(item, start, end)
    })
  }

  sort(compare) {
    return this.$transaction(array => {
      array.$value.sort(compare)
    })
  }

  splice(start, count, ...items) {
    let removed

    this.$transaction(array => {
      removed = array.$value.splice(start, count, ...items)
    })

    return removed
  }

  copyWithin(target, start, end) {
    return this.$transaction(array => {
      array.$value.copyWithin(target, start, end)
    })
  }

  shift() {
    let shifted

    this.$transaction(array => {
      shifted = array.$value.shift()
    })

    return shifted
  }

  unshift(item) {
    let length

    this.$transaction(array => {
      length = array.$value.unshift(item)
    })

    return length
  }

  reverse() {
    let reversed

    this.$transaction(array => {
      reversed = array.$value.reverse()
    })

    return reversed
  }

  $unpack() {
    return [ ...this.$value ]
  }
}
