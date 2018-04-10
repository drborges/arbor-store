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

  complement(path) {
    if (this.props.length === 0) return path
    const complementIndex = path.props.findIndex((prop, i) => prop !== this.props[i])
    switch (complementIndex) {
      case 0:
      case -1: return new Path
      default: return new Path(path.props.slice(complementIndex))
    }
  }

  walk(node) {
    return this.props.reduce((parent, prop) => {
      const childCopy = parent[prop].$copy
      parent.$value[prop] = childCopy
      return childCopy
    }, node)
  }

  toString() {
    return `/${this.props.join("/")}`
  }
}
