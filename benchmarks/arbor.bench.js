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

benchmark.measure(`Redux-like mutation on Array(${arrayLength})`, () => {
  const copy = arrayWith(arrayLength, (i) => ({ done: false })).map(todo => ({ done: !todo.done }))
})

benchmark.measure(`Arbor mutation on Array(${arrayLength})`, () => {
  largeTree.root.todos.forEach(todo => {
    todo.done = !todo.done
  })
})

benchmark.measure(`Arbor transactional mutation on Array(${arrayLength})`, () => {
  largeTree.root.todos.$transaction(todos => {
    todos.forEach(todo => {
      todo.done = !todo.done
    })
  })
})

benchmark.measure(`Arbor reverse Array(${arrayLength})`, () => {
  largeTree.root.todos.reverse()
})

benchmark.measure(`Arbor sorting Array(${arrayLength})`, () => {
  largeTree.root.todos.sort((todo1, todo2) => {
    if (todo1.done) return 1
    if (todo2.done) return -1
    return 0
  })
})

console.log(benchmark.reports)
