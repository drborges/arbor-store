import sinon from "sinon"
import { expect } from "chai"

import Path from "../src/path"
import PubSub from "../src/pubsub"

describe("PubSub", () => {
  describe("#subscribe", () => {
    it("registers a subscriber to a given path", () => {
      const subscriber = sinon.spy()
      const pubsub = new PubSub

      pubsub.subscribe(Path.root, subscriber)

      expect(pubsub.subscriptions).to.deep.eq([
        {
          path: Path.root,
          subscriber: subscriber,
        },
      ])
    })

    it("registers a subscriber to a given path", () => {
      const subscriber = sinon.spy()
      const pubsub = new PubSub

      pubsub.subscribe("/users/:index", subscriber)
      pubsub.subscribe("/users/:index/posts/:index", subscriber)

      expect(pubsub.subscriptions).to.deep.eq([
        {
          path: "/users/:index",
          subscriber: subscriber,
        },
        {
          path: "/users/:index/posts/:index",
          subscriber: subscriber,
        },
      ])
    })

    it("unsubscribes a subscriber from a given path", () => {
      const subscriber = sinon.spy()
      const pubsub = new PubSub

      const unsubscribe = pubsub.subscribe("/users/:index", subscriber)
      unsubscribe()

      expect(pubsub.subscriptions).to.be.empty
    })
  })

  describe("#publish", () => {
    it("notifies root path subscribers about mutations", () => {
      const subscriber = sinon.spy()
      const pubsub = new PubSub

      const oldState = {
        users: [
          { posts: [{ title: "a post" }] },
          { posts: [{ title: "old value" }] },
        ]
      }

      const newState = {
        users: [
          { posts: [{ title: "a post" }] },
          { posts: [{ title: "new value" }] },
        ]
      }

      pubsub.subscribe(Path.root, subscriber)
      pubsub.publish(Path.parse("/users/1/posts/0/title"), oldState, newState)

      expect(subscriber).to.have.been.calledWith(oldState, newState)
    })

    it("notifies path subscribers about mutations to a given path", () => {
      const subscriber = sinon.spy()
      const pubsub = new PubSub

      const oldState = {
        users: [
          { posts: [{ title: "a post" }] },
          { posts: [{ title: "old value" }] },
        ]
      }

      const newState = {
        users: [
          { posts: [{ title: "a post" }] },
          { posts: [{ title: "new value" }] },
        ]
      }

      pubsub.subscribe("/users/:index/posts/:index/title", subscriber)
      pubsub.publish(Path.parse("/users/1/posts/0/title"), oldState, newState)

      expect(subscriber).to.have.been.calledWith("old value", "new value")
    })
  })
})
