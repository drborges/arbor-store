/*
 * Mutation operations are always applied to new copies of the affected node and
 * they have two important responsibilities:
 *
 * 1. Mutate $value (underlying proxied value): Mutate the node's $value into
 * the desired state
 * 2. Refresh $children: Only refresh affected entries in node.$children with
 * new Node instances. This leverages Structural Sharing for optimal performance
 */


const set = (value) => (node, prop) => {
  node.$value[prop] = value
  delete node.$children[prop]
}

const splice = (start, removeCount, newItems) => (node) => {
  node.$value.splice(start, removeCount, ...newItems)

  const childrenCount = Object.keys(node.$children).length
  for (let i = start; i < childrenCount; i++) {
    delete node.$children[i]
  }
}

const sort = (compare) => (node) => {
  node.$children = node.$value.sort(compare).map((item, i) => {
    return (node[i].$value === item) ?
      node[i] :
      node.createChild(i, item)
  })
}

const copyWithin = (target, start, end) => (node) => {
  node.$value.copyWithin(target, start, end)
  for (let i = target; i <= end; i++) {
    delete node.$children[i]
  }
}

const reverse = () => (node) => {
  node.$children = node.$value.reverse().map((item, i) => {
    return (node[i].$value === item) ?
      node[i] :
      node.createChild(i, item)
  })
}

const shift = () => (node) => {
  node.$children = []
  node.$value.shift()
}

const transaction = (fn) => (node) => {
  node.$tree.transactionNode = node
  fn(node)
  node.$tree.transactionNode = null
}

const unshift = (items) => (node) => {
  node.$children = []
  node.$value.unshift(...items)
}

export default {
  copyWithin,
  reverse,
  set,
  shift,
  sort,
  splice,
  transaction,
  unshift,
}
