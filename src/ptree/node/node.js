import mutations from "../mutations"

const isMutationMethod = (prop) => Object.keys(mutations).includes(prop)
const isLeafNode = (value) =>
  value === undefined ||
  value === null ||
  value.constructor !== Object &&
  value.constructor !== Array

export default class Node {
  constructor($tree, $path, value, $children = {}) {
    this.$tree = $tree
    this.$path = $path
    this.$value = value
    this.$children = $children
  }

  get(target, prop) {
    const value = target[prop]
    const childPath = this.$path.child(prop)

    if (this[prop]) {
      return isMutationMethod(prop) ? this[prop](childPath) : this[prop]
    }

    if (isLeafNode(value)) {
      return value
    }

    if (!this.$children[prop]) {
      this.createChild(prop, value)
    }

    return this.$children[prop]
  }

  set(target, prop, value) {
    if (this[prop]) {
      this[prop] = value
    } else {
      this.$tree.mutate(this.$path.child(prop), mutations.set(value))
    }

    return true
  }

  createChild(prop, value) {
    return this.$children[prop] = this.$tree.create(this.$path.child(prop), value)
  }
}
