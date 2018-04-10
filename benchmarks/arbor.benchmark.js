const Arbor = require("../lib").default
const Benchmark = require("./benchmark")

const arrayWith = (length, itemFactory) => {
  const arr = Array(length)

  for (let i = 0; i < length; i++) {
    arr[i] = itemFactory(i)
  }

  return arr
}

const arrayLength = 100000

const largeStore = new Arbor({
  todos: arrayWith(arrayLength, (i) => ({ done: false })),
})

const benchmark = new Benchmark({ sample: 10 })

benchmark.measure(`Redux-like mutation on all items within Array(${arrayLength})`, () => {
  const copy = arrayWith(arrayLength, (i) => ({ done: false })).map(todo => ({ done: !todo.done }))
})

benchmark.measure(`Arbor mutate a single item within Array(${arrayLength})`, () => {
  largeStore.state.todos[100].done = !largeStore.state.todos[100].done
})

benchmark.measure(`Arbor: atomically mutates a single item within Array(${arrayLength})`, () => {
  largeStore.state.todos.$atomic(todos => {
    todos[100].done = !todos[100].done
  })
})

benchmark.measure(`Arbor: atomically mutates all items within Array(${arrayLength})`, () => {
  largeStore.state.todos.$atomic(todos => {
    todos.forEach(todo => { todo.done = !todo.done })
  })
})

benchmark.measure(`Arbor: ArrayNode(${arrayLength}).$copy`, () => {
  largeStore.state.todos.$copy
})

benchmark.measure(`Arbor reverse Array(${arrayLength})`, () => {
  largeStore.state.todos.reverse()
})

benchmark.measure(`Arbor sorting Array(${arrayLength})`, () => {
  largeStore.state.todos.sort((todo1, todo2) => {
    if (todo1.done) return 1
    if (todo2.done) return -1
    return 0
  })
})

benchmark.reports.forEach(report => console.log(
  `
  name: ${report.name}
  samples: ${report.samples.join(", ")}
  fastest: ${report.fastest}
  slowest: ${report.slowest}
  avg: ${report.avg}
  `
))
