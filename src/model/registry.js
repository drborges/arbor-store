export default class Registry {
  models = {}

  fetch(path) {
    const registeredPaths = Object.keys(this.models)
    const registeredPath = registeredPaths.find(registeredPath => path.match(registeredPath))
    return this.models[registeredPath]
  }

  register(path, Type) {
    this.models[path.toString()] = Type
  }
}
