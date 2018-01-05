const Arbor = require("../lib").Arbor
const Benchmark = require("./benchmark")

const arrayWith = (length, itemFactory) => {
  const arr = Array(length)

  for (let i = 0; i < length; i++) {
    arr[i] = itemFactory(i)
  }

  return arr
}

const arrayLength = 10000

const largeTree = new Arbor({
  todos: arrayWith(arrayLength, (i) => ({ done: false })),
})

const benchmark = new Benchmark({ sample: 10 })
const reports = []

reports.push(benchmark.measure(`Redux-like mutation on Array(${arrayLength})`, () => {
  const copy = arrayWith(arrayLength, (i) => ({ done: false })).map(todo => ({ done: !todo.done }))
}))

reports.push(benchmark.measure(`Arbor mutation on Array(${arrayLength})`, () => {
  largeTree.root.todos.forEach(todo => { todo.done = !todo.done })
}))

reports.push(benchmark.measure(`Arbor transactional mutation on Array(${arrayLength})`, () => {
  largeTree.root.todos.transaction(todos => {
    todos.forEach(todo => { todo.done = !todo.done })
  })
}))

console.log(reports)
