export default class Stack {
  items = []

  push(item) {
    this.items.push(item)
  }

  pop() {
    return this.items.pop()
  }

  clear() {
    this.items = []
  }

  peek() {
    return this.items.slice(-1)[0]
  }

  get length() {
    return this.items.length
  }
}
