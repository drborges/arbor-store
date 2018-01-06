import Node from "./node"

export default class ArrayNode extends Node {
  fill(item, start, end) {
    return this.$transaction(array => {
      array.$refresh().$value.fill(item, start, end)
    })
  }

  sort(compare) {
    return this.$transaction(array => {
      array.$refresh().$value.sort(compare)
    })
  }

  splice(start, count, ...items) {
    let removed

    this.$transaction(array => {
      removed = array.$refresh().$value.splice(start, count, ...items)
    })

    return removed
  }

  copyWithin(target, start, end) {
    return this.$transaction(array => {
      array.$refresh().$value.copyWithin(target, start, end)
    })
  }

  shift() {
    let shifted

    this.$transaction(array => {
      shifted = array.$refresh().$value.shift()
    })

    return shifted
  }

  unshift(item) {
    let length

    this.$transaction(array => {
      length = array.$refresh().$value.unshift(item)
    })

    return length
  }

  reverse() {
    let reversed

    this.$transaction(array => {
      reversed = array.$refresh().$value.reverse()
    })

    return reversed
  }

  $unpack() {
    return [ ...this.$value ]
  }
}
