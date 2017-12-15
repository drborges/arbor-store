import React from "react"

export default function connect(store) {
  return function(Target) {
    return class extends React.Component {
      state = store.state

      componentDidMount() {
        super.componentDidMount && super.componentDidMount()
        this.unsubscribe = store.subscribe("/", (state) => {
          this.setState(state, () => { this.state = state })
        })
      }

      componentWillUnmount() {
        super.componentWillUnmount && super.componentWillUnmount()
        this.unsubscribe()
      }

      render() {
        return <Target {...this.state} />
      }
    }
  }
}
