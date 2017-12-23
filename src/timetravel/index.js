import Timeline from "./timeline"

const timetravel = (Store) => class extends Store {
  constructor(initialState, options) {
    super(initialState, options)
    this.timeline = new Timeline(this)
  }
}

export default timetravel
