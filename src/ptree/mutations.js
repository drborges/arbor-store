const set = (value) => (node, prop) => {
  node.$value[prop] = value
  delete node.$children[prop]
}

const push = (item) => (node) => {
  node.$value.push(item)
}

const splice = (start, removeCount, newItems) => (node) => {
  node.$value.splice(start, removeCount, ...newItems)

  const childrenCount = Object.keys(node.$children).length
  for (let i = start; i < childrenCount; i++) {
    delete node.$children[i]
  }
}

export default {
  set,
  push,
  splice,
}
