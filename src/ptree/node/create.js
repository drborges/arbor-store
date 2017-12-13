import NodeArray from "./array"
import NodeObject from "./object"

const create = (tree, path, value, children) => Array.isArray(value) ?
  new NodeArray(tree, path, value, children) :
  new NodeObject(tree, path, value, children)

export default create
