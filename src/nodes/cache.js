export default class Cache {
  items = new WeakMap

  set(key, value) {
    this.items.set(key, value)
  }

  get(key) {
    return this.items.get(key)
  }

  has(key) {
    return this.items.has(key)
  }

  delete(key) {
    return this.items.delete(key)
  }

  clear() {
    this.items = new WeakMap
  }
}