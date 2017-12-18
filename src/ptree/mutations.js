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

export default {
  copyWithin,
  reverse,
  set,
  shift,
  sort,
  splice,
}
