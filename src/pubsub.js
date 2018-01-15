import Path from "./path"

export default class PubSub {
  subscriptions = []

  subscribe(path, subscriber) {
    const subscription = { path, subscriber }
    this.subscriptions.push(subscription)

    return () => {
      this.subscriptions = this.subscriptions.filter(s => s !== subscription)
    }
  }

  publish(mutationPath, newRoot, oldRoot = null) {
    this.subscriptions.forEach(({ path, subscriber }) => {
      if (path === Path.root) {
        subscriber(newRoot, oldRoot)
      } else if (mutationPath.match(path)) {
        const newValue = newRoot ? mutationPath.traverse(newRoot) : newRoot
        const oldValue = oldRoot ? mutationPath.traverse(oldRoot) : oldRoot
        subscriber(newValue, oldValue)
      }
    })
  }
}
