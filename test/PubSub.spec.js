import sinon from "sinon"
import { expect } from "chai"

import PubSub from "../src/PubSub"

describe("PubSub", () => {
  describe("#subscribe", () => {
    it("adds a subscriber to the list of subscribers", () => {
      const pubsub = new PubSub
      const subscriber = () => {}
      pubsub.subscribe(subscriber)

      expect(pubsub.subscribers).to.deep.eq([
        subscriber,
      ])
    })
  })

  describe("#unsubscribe", () => {
    it("removes a subscriber from the list of subscribers", () => {
      const pubsub = new PubSub
      const subscriber = () => {}
      pubsub.subscribers = [subscriber]

      pubsub.unsubscribe(subscriber)

      expect(pubsub.subscribers).to.be.empty
    })
  })

  describe("#notify", () => {
    it("notifies all subscribers about state changes", () => {
      const pubsub = new PubSub
      const subscriber1 = sinon.spy()
      const subscriber2 = sinon.spy()
      const prevState = {}
      const nextState = {}

      pubsub.subscribe(subscriber1)
      pubsub.subscribe(subscriber2)
      pubsub.notify(nextState, prevState)

      expect(subscriber1).to.have.been.calledWith(nextState, prevState)
      expect(subscriber2).to.have.been.calledWith(nextState, prevState)
    })
  })
})
