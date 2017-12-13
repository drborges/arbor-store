const cached = (computeKey) => (Target) => {
  const cache = {}

  return class {
    constructor() {
      const key = computeKey(...arguments)

      if (!cache[key]) {
        cache[key] = new Target(...arguments)
      }

      return cache[key]
    }
  }
}

export default cached
