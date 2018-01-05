class Benchmark {
  constructor({ sample }) {
    this.sample = sample
  }

  measure(name, fn) {
    const executions = []

    for (let i = 0; i < this.sample; i++) {
      const executionStartTime = new Date().getTime()
      fn()
      const executionEndTime = new Date().getTime()
      executions.push(executionEndTime - executionStartTime)
    }

    executions.sort()

    return {
      name,
      executions,
      fastest: executions[0],
      slowest: executions[executions.length - 1],
      avg: executions.reduce((sum, next) => sum + next, 0) / executions.length
    }
  }
}

module.exports = Benchmark
