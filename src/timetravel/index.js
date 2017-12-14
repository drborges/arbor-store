import Timeline from "./timeline"

const timetravel = (Store) => class extends Store {
  constructor(initialState) {
    super(initialState)
    this.timeline = new Timeline(this)
  }
}

export default timetravel
