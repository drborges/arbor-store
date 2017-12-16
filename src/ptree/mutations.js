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

export default {
  set,
  splice,
}
