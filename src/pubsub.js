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

  publish(mutationPath, newRoot, oldRoot) {
    this.subscriptions.forEach(({ path, subscriber }) => {
      if (path === Path.root) {
        subscriber(newRoot, oldRoot)
      } else if (mutationPath.match(path)) {
        subscriber(mutationPath.traverse(newRoot), mutationPath.traverse(oldRoot))
      }
    })
  }
}
