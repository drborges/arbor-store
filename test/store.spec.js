import sinon from "sinon"
import { expect } from "chai"

import Store from "../src"

describe("Store", () => {
  describe("#subscribe", () => {
    it("subscribes to any mutations when no path is provided", (done) => {
      const store = new Store({ user: { name: "Diego" }})

      store.subscribe(state => {
        expect(state).to.deep.eq({
          user: { name: "Borges" }
        })

        done()
      })

      store.state.user.name = "Borges"
    })

    it("allows for async initial state", (done) => {
      const store = new Store()
      const data = { name: "Diego" }
      const statePromise = new Promise(resolve => setTimeout(() => {
        resolve(data)
      }, 20))

      store.subscribe(state => {
        expect(state).to.deep.eq(data)
        done()
      })

      store.set(statePromise)
    })
  })
})
