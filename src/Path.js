export default class Path {
  static cache = {}

  static parse(str) {
    return new Path(str.split("/").filter(prop => prop !== ""))
  }

  static get root() {
    return new Path
  }

  constructor(props = []) {
    const key = props.join("/")
    if (!Path.cache[key]) {
      this.props = props
      Path.cache[key] = this
    }

    return Path.cache[key]
  }

  child(prop) {
    return new Path(this.props.concat(prop))
  }

  match(path) {
    const pattern = new RegExp(`^${path.toString().replace(/:index/g, "\\d+")}$`)
    return pattern.test(this.toString())
  }

  walk(node) {
    return this.props.reduce((parent, prop) => {
      const child = parent[prop].$copy
      parent.$value[prop] = child
      return child
    }, node)
  }

  toString() {
    return `/${this.props.join("/")}`
  }
}
