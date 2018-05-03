export default class TypeRegistry {
  types = {}

  fetch(path) {
    const registeredPaths = Object.keys(this.types)
    const registeredPath = registeredPaths.find(registeredPath => {
      return path.match(registeredPath)
    })

    return this.types[registeredPath]
  }

  register(path, Type) {
    this.types[path.toString()] = Type
  }

  has(type) {
    return Object.values(this.types).includes(type)
  }
}
