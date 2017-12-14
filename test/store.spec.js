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
  })
})
