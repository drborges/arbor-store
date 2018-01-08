import Node from "./node"
import ArrayNode from "./array"
import ObjectNode from "./object"

const createNode = (tree, path, value, children) => Array.isArray(value) ?
  new ArrayNode(tree, path, value, children) :
  new ObjectNode(tree, path, value, children)

export default createNode
export { Node, ArrayNode, ObjectNode }
