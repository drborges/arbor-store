import sinon from "sinon"
import { expect } from "chai"

import Store, { timetravel } from "../../src"

describe("#timeline", () => {
  const StoreWithTimetravel = timetravel(Store)

  describe("#move", () => {
    it("moves back in time", () => {
      const store = new StoreWithTimetravel({
        user: {
          name: "Diego",
          age: 32,
        }
      })

      store.timeline.on()

      store.state.user.name = "Bianca"
      store.state.user.age = 24

      expect(store.state.user).to.deep.eq({
        name: "Bianca",
        age: 24,
      })

      store.timeline.travel.step(-1)

      expect(store.state.user).to.deep.eq({
        name: "Bianca",
        age: 32,
      })

      store.timeline.travel.step(-1)

      expect(store.state.user).to.deep.eq({
        name: "Diego",
        age: 32,
      })

      store.timeline.travel.step(-1)

      expect(store.state.user).to.deep.eq({
        name: "Diego",
        age: 32,
      })
    })

    it("moves forward in time", () => {
      const store = new StoreWithTimetravel({
        user: {
          name: "Diego",
          age: 32,
        }
      })

      store.timeline.on()

      store.state.user.name = "Bianca"
      store.state.user.age = 24

      store.timeline.travel.step(-2)
      store.timeline.travel.step(1)

      expect(store.state.user).to.deep.eq({
        name: "Bianca",
        age: 32,
      })

      store.timeline.travel.step(1)

      expect(store.state.user).to.deep.eq({
        name: "Bianca",
        age: 24,
      })

      store.timeline.travel.step(1)

      expect(store.state.user).to.deep.eq({
        name: "Bianca",
        age: 24,
      })
    })
  })

  describe("#travelTo", () => {
    it("moves to an especific point in time", () => {
      const store = new StoreWithTimetravel({
        user: {
          name: "Diego",
          age: 32,
        }
      })

      store.timeline.on()

      store.state.user.name = "Bianca"
      store.state.user.age = 24

      store.timeline.travel.to(1)

      expect(store.state.user).to.deep.eq({
        name: "Bianca",
        age: 32,
      })
    })

    it("does not move time out of its boundaries", () => {
      const store = new StoreWithTimetravel({
        user: {
          name: "Diego",
          age: 32,
        }
      })

      store.timeline.on()

      store.state.user.name = "Bianca"
      store.state.user.age = 24

      store.timeline.travel.to(3)

      expect(store.timeline.cursor).to.eq(2)

      store.timeline.travel.to(-1)

      expect(store.timeline.cursor).to.eq(0)
    })
  })

  describe("#origin", () => {
    it("moves to the beginning of time", () => {
      const store = new StoreWithTimetravel({
        user: {
          name: "Diego",
          age: 32,
        }
      })

      store.timeline.on()

      store.state.user.name = "Bianca"
      store.state.user.age = 24

      store.timeline.travel.origin()

      expect(store.state.user).to.deep.eq({
        name: "Diego",
        age: 32,
      })
    })
  })

  describe("#present", () => {
    it("moves time to the present state", () => {
      const store = new StoreWithTimetravel({
        user: {
          name: "Diego",
          age: 32,
        }
      })

      store.timeline.on()

      store.state.user.name = "Bianca"
      store.state.user.age = 24

      store.timeline.travel.step(-2)
      store.timeline.travel.present()

      expect(store.state.user).to.deep.eq({
        name: "Bianca",
        age: 24,
      })
    })
  })

  describe("#on", () => {
    it("turns timetravel on", () => {
      const store = new StoreWithTimetravel({
        user: {
          name: "Diego",
          age: 32,
        }
      })

      expect(store.timeline.isOn).to.eq(false)
      expect(store.timeline.isOff).to.eq(true)

      store.timeline.on()

      expect(store.timeline.isOn).to.eq(true)
      expect(store.timeline.isOff).to.eq(false)
    })
  })

  describe("#off", () => {
    it("turns timetravel off", () => {
      const store = new StoreWithTimetravel({
        user: {
          name: "Diego",
          age: 32,
        }
      })

      store.timeline.on()

      expect(store.timeline.isOn).to.eq(true)
      expect(store.timeline.isOff).to.eq(false)

      store.timeline.off()

      expect(store.timeline.isOn).to.eq(false)
      expect(store.timeline.isOff).to.eq(true)
    })

    it("one can still travel through time when timetravel is off", () => {
      const store = new StoreWithTimetravel({
        user: {
          name: "Diego",
          age: 32,
        }
      })

      store.timeline.on()

      store.state.user.name = "Bianca"

      store.timeline.off()

      store.timeline.travel.origin()

      expect(store.state.user.name).to.eq("Diego")
    })
  })
})
