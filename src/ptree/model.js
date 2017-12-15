const Model = (Target) => class Model extends Target {
  constructor(node) {
    super()
    return this.$proxy = new Proxy(node, this)
  }

  get(target, prop) {
    // Make sure getters are bound to the proxy, allowing them to access the
    // proxied data through 'this'.
    const thisValue = Reflect.get(this, prop, this.$proxy)

    if (thisValue !== undefined) {
      return thisValue
    }

    return target[prop]
  }
}

export default Model
