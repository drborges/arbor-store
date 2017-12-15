import React from "react"
import sinon from "sinon"
import { expect } from "chai"
import { shallow } from "enzyme"

import Store from "../../src"
import connect from "../../src/react/connect"

describe("connect", () => {
  class Counter extends React.Component {
    render() {
      return (
        <span>{this.state.count}</span>
      )
    }
  }

  it("subscribes a React component to store mutations", () => {
    const store = new Store({ count: 0 })
    const CounterApp = connect(store)(Counter)

    const wrapper = shallow(<CounterApp />)

    store.state.count++

    wrapper.update()

    expect(wrapper.find("span")).to.have.text("1")

    store.state.count++

    wrapper.update()

    expect(wrapper.find("span")).to.have.text("2")
  })

  it("unsubscribes a React component from store mutations", () => {
    const store = new Store({ count: 0 })
    const CounterApp = connect(store)(Counter)

    const wrapper = shallow(<CounterApp />)

    expect(store.tree.pubsub.subscriptions["/"]).to.not.be.empty

    wrapper.instance().componentWillUnmount()

    expect(store.tree.pubsub.subscriptions["/"]).to.be.empty
  })
})
