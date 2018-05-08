import Node from "./Node"

export default class ObjectNode extends Node {
  get $copy() {
    return this.$tree.add(this.$path, { ...this.$value })
  }
}
