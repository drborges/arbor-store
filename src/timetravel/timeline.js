import { Path, create } from "../ptree"

export default class Timeline {
  constructor(store) {
    this.store = store
    this.cursor = 0
    this.history = []
    this.history.push(this.store.state)
  }

  on() {
    this.unsubscribe = this.store.subscribe(state => {
      this.history.push(state)
      this.travel.present()
    })
  }

  off() {
    this.unsubscribe && this.unsubscribe()
    this.unsubscribe = undefined
  }

  get isOn() {
    return this.unsubscribe !== undefined
  }

  get isOff() {
    return !this.isOn
  }

  go() {
    if (this.cursor < 0) {
      // pin cursor at the first history entry
      this.cursor = 0
    }

    if (this.cursor >= this.history.length) {
      // pin cursor at the last history entry
      this.cursor = this.history.length - 1
    }

    const state = this.history[this.cursor]

    this.off()
    this.store.tree.root = create(this.store.tree, Path.root, state, state.$children)
    this.store.tree.pubsub.publish(Path.root, state)
    this.on()
  }

  get travel() {
    const timeline = this
    return {
      step(n = 0) {
        const prevCursor = this.cursor
        timeline.cursor += n

        if (timeline.cursor !== prevCursor) {
          timeline.go()
        }
      },

      to(cursor = 0) {
        timeline.cursor = cursor
        timeline.go()
      },

      origin() {
        timeline.cursor = 0
        timeline.go()
      },

      present() {
        timeline.cursor = timeline.history.length - 1
        timeline.go()
      },
    }
  }
}
