import Node from "./Node"

export default class ObjectNode extends Node {
  constructor(tree, path, value) {
    super(tree, path, value)
  }

  get $copy() {
    return this.$tree.add(this.$path, { ...this.$value })
  }
}
