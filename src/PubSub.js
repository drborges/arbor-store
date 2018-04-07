export default class PubSub {
  subscribers = []

  subscribe(subscriber) {
    this.subscribers.push(subscriber)
  }

  unsubscribe(subscriber) {
    this.subscribers = this.subscribers.filter(s => s !== subscriber)
  }

  notify(nextState, previousState) {
    this.subscribers.forEach(subscriber => {
      subscriber(nextState, previousState)
    })
  }
}
