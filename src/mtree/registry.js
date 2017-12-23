export default class Registry {
  registry = {}

  fetch(path) {
    const registeredPaths = Object.keys(this.registry)
    const registeredPath = registeredPaths.find(registeredPath => path.match(registeredPath))
    return this.registry[registeredPath]
  }

  register(path, Type) {
    const regexPath = path.toString().replace(":index", "\\d+")
    this.registry[regexPath] = Type
  }
}
