const findSubscription = (subscriptions = {}, path) => {
  const subscriptionPaths = Object.keys(subscriptions)
  const subscriptionPath = subscriptionPaths.find(p => path.match(p))
  const subscribers = subscriptions[subscriptionPath]

  return subscriptionPath ? [subscriptionPath, subscribers] : [path]
}

export default class Pubsub {
  subscriptions = {}

  subscribe(path, subscriber) {
    const [subscriptionPath, subscribers] = findSubscription(this.subscriptions, path)

    if (!subscribers) {
      this.subscriptions[subscriptionPath] = []
    }

    this.subscriptions[subscriptionPath].push(subscriber)

    return () => this.unsubscribe(subscriptionPath, subscriber)
  }

  unsubscribe(path, subscriber) {
    this.subscriptions[path] = this.subscriptions[path].filter(s => s !== subscriber)
  }

  publish(path, node) {
    const [_, subscribers] = findSubscription(this.subscriptions, path)

    if (subscribers) {
      subscribers.forEach(subscriber => subscriber(node))
    }
  }
}
