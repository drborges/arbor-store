import Timeline from "./timeline"

const timetravel = (store) => {
  store.timeline = new Timeline(store)
  return store
}

export default timetravel
