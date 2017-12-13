export default function connect(store) {
  return function(Target) {
    return class extends Target {
      state = store.state

      componentDidMount() {
        super.componentDidMount && super.componentDidMount()
        this.unsubscribe = store.subscribe("/", (state) => this.setState(state))
      }

      componentWillUnmount() {
        super.componentWillUnmount && super.componentWillUnmount()
        this.unsubscribe()
      }
    }
  }
}
