const Model = (Target) => class Model extends Target {
  constructor(node) {
    super()
    return this.$proxy = new Proxy(node, this)
  }

  get(target, prop) {
    const targetValue = target[prop]

    if (typeof targetValue === "function") {
      return targetValue.bind(target)
    }

    // Make sure getters are bound to the proxy, allowing them to access the
    // proxied data through 'this'.
    const thisValue = Reflect.get(this, prop, this.$proxy)


    // Make sure functions are always bound to the proxy even when passing them
    // around as reference, React example:
    //
    // <input onChange={todo.toggle} />
    //
    // The toggle method in the example above will still be bound to the todo
    // object. Without this workaround, we'd have to write the example above as:
    //
    // <input onChange={todo.toggle.bind(todo)} />
    //
    // or
    //
    // <input onChange={() => todo.toggle()} />
    //
    if (typeof thisValue === "function") {
      return thisValue.bind(this.$proxy)
    }

    if (thisValue !== undefined) {
      return thisValue
    }

    return target[prop]
  }
}

export default Model
