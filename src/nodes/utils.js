export const proxiable = (value) =>
  value !== undefined &&
  value !== null && (
    value.constructor === Object ||
    value.constructor === Array
  )

export const unpack = (value) => value && value.$value !== undefined ?
  value.$unpack() :
  value

export const createMutator = (data) => new Proxy(data, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver)

    if (typeof value === "function") {
      return value.bind(target)
    }

    if (!proxiable(value)) {
      return value
    }

    target[prop] = Array.isArray(value) ?
      [ ...value ] :
      { ...value }

    return createMutator(target[prop])
  },

  set(target, prop, value) {
    target[prop] = unpack(value)
    return true
  }
})

export const mutations = {
  set: (value) => (node, prop) => {
    node.$value[prop] = unpack(value)
    return node
  },

  mutate: (fn) => (node, prop) => {
    node.$tree.mutationTarget = node[prop]
    const mutator = createMutator(node.$value)
    const result = fn(mutator[prop])
    node.$tree.mutationTarget = null
    return result
  }
}
