import create from "./create"
import mutations from "../mutations"

const isMutationMethod = (prop) => Object.keys(mutations).includes(prop)

export default class Node {
  constructor($tree, $path, value, $children = {}) {
    this.$tree = $tree
    this.$path = $path
    this.$value = value
    this.$children = $children
  }

  get(target, prop) {
    if (this.hasOwnProperty(prop)) {
      return isMutationMethod(prop) ?
        this[prop](this.$path.child(prop)) :
        this[prop]
    }

    if (target[prop] === undefined) {
      return undefined
    }

    const childPath = this.$path.child(prop)
    const value = target[prop]

    if (value.constructor !== Object && value.constructor !== Array) {
      return target[prop]
    }

    if (!this.$children[prop]) {
      this.$children[prop] = create(this.$tree, childPath, value)
    }

    return this.$children[prop]
  }

  set(target, prop, value) {
    const path = this.$path.child(prop)
    this.$tree.mutate(path, mutations.set(value))

    return true
  }
}
