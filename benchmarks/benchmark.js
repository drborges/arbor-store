class Benchmark {
  constructor({ sample }) {
    this.sample = sample
    this.reports = []
  }

  xmeasure(name, fn) {
    this.reports.push({
      name: `Skipped: ${name}`,
      samples: [],
      fastest: null,
      slowest: null,
      avg: null,
    })
  }

  measure(name, fn) {
    let result
    const samples = []

    for (let i = 0; i < this.sample; i++) {
      const executionStartTime = new Date().getTime()
      result = fn()
      const executionEndTime = new Date().getTime()
      samples.push(executionEndTime - executionStartTime)
    }

    samples.sort((time1, time2) => time1 - time2)

    this.reports.push({
      name,
      samples,
      fastest: samples[0],
      slowest: samples[samples.length - 1],
      avg: samples.reduce((sum, next) => sum + next, 0) / samples.length
    })

    return result
  }
}

module.exports = Benchmark
