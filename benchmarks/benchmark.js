class Benchmark {
  constructor({ sample }) {
    this.sample = sample
    this.reports = []
  }

  measure(name, fn) {
    let result
    const executions = []

    for (let i = 0; i < this.sample; i++) {
      const executionStartTime = new Date().getTime()
      result = fn()
      const executionEndTime = new Date().getTime()
      executions.push(executionEndTime - executionStartTime)
    }

    executions.sort()

    this.reports.push({
      name,
      executions,
      fastest: executions[0],
      slowest: executions[executions.length - 1],
      avg: executions.reduce((sum, next) => sum + next, 0) / executions.length
    })

    return result
  }
}

module.exports = Benchmark
