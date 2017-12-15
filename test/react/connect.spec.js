import React from "react"
import sinon from "sinon"
import { expect } from "chai"
import { mount } from "enzyme"

import Store from "../../src"
import connect from "../../src/react/connect"

describe("connect", () => {
  const Counter = ({ counter }) => {
    return (
      <div>
        <span>{counter.count}</span>
        <button onClick={() => counter.count++} />
      </div>
    )
  }

  it("subscribes a React component to store mutations", () => {
    const store = new Store({ counter: { count: 0 } })
    const CounterApp = connect(store)(Counter)

    const wrapper = mount(<CounterApp />)

    store.state.counter.count++

    wrapper.update()

    expect(wrapper.find("span")).to.have.text("1")

    store.state.counter.count++

    wrapper.update()

    expect(wrapper.find("span")).to.have.text("2")
  })

  it("can mutate state from within a stateless component", () => {
    const store = new Store({ counter: { count: 0 } })
    const CounterApp = connect(store)(Counter)

    const wrapper = mount(<CounterApp />)

    wrapper.find("button").props().onClick()

    wrapper.update()

    expect(wrapper.find("span")).to.have.text("1")

    wrapper.find("button").props().onClick()

    wrapper.update()

    expect(wrapper.find("span")).to.have.text("2")
  })

  it("unsubscribes a React component from store mutations", () => {
    const store = new Store({ counter: { count: 0 } })
    const CounterApp = connect(store)(Counter)

    const wrapper = mount(<CounterApp />)

    expect(store.tree.pubsub.subscriptions["/"]).to.not.be.empty

    wrapper.instance().componentWillUnmount()

    expect(store.tree.pubsub.subscriptions["/"]).to.be.empty
  })

  it("provides a human-friendly displayName to the connected component", () => {
    const store = new Store({ counter: { count: 0 } })
    const CounterApp = connect(store)(Counter)

    expect(CounterApp.displayName).to.eq("Connect(Counter)")
  })
})
