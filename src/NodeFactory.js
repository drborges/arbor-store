import ArrayNode from "./ArrayNode"
import ObjectNode from "./ObjectNode"

export default class NodeFactory {
  constructor(tree) {
    this.tree = tree
  }

  create(path, value) {
    const Node = Array.isArray(value) ?
      ArrayNode :
      ObjectNode

    return new Proxy(value, new Node(this.tree, path, value))
  }
}
