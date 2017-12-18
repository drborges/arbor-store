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

export default {
  set,
  sort,
  splice,
}
