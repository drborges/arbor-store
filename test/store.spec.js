import sinon from "sinon"
import { expect } from "chai"

import Store from "../src"
import PTree from "../src/ptree"
import MTree from "../src/mtree"

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
      const data = { name: "Diego" }
      const statePromise = new Promise(resolve => setTimeout(() => {
        resolve(data)
      }, 20))

      const store = new Store(statePromise)

      store.subscribe(state => {
        expect(state).to.deep.eq(data)
        done()
      })
    })

    it("allows overriding state tree engine", () => {
      const initialState = {}
      const store1 = new Store(initialState, { Engine: MTree })
      expect(store1.tree).to.be.an.instanceof(MTree)

      const store2 = new Store(initialState, { Engine: PTree })
      expect(store2.tree).to.be.an.instanceof(PTree)
    })
  })
})
