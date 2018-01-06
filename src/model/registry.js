export default class Registry {
  registry = {}

  fetch(path) {
    const registeredPaths = Object.keys(this.registry)
    const registeredPath = registeredPaths.find(registeredPath => path.match(registeredPath))
    return this.registry[registeredPath]
  }

  register(path, Type) {
    this.registry[path.toString()] = Type
  }
}
