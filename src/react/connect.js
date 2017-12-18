import React from "react"

export default function connect(store) {
  return function(Target) {
    return class extends React.Component {
      state = store.state

      static displayName = `Connect(${Target.displayName || Target.name})`

      componentDidMount() {
        super.componentDidMount && super.componentDidMount()
        this.unsubscribe = store.subscribe(state => this.setState(state))
      }

      componentWillUnmount() {
        super.componentWillUnmount && super.componentWillUnmount()
        this.unsubscribe()
      }

      render() {
        return <Target {...this.props} {...this.state} />
      }
    }
  }
}
