import Node from "./node"

export default class ObjectNode extends Node {
  $unpack() {
    return { ...this.$value }
  }
}
