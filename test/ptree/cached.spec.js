import sinon from "sinon"
import { expect } from "chai"

import cached from "../../src/ptree/cached"

describe("@cached", () => {

  @cached((name, age) => name)
  class Person {
    constructor(name, age) {
      this.name = name
      this.age = age
    }
  }

  @cached((name, email) => email)
  class Employee {
    constructor(name, email) {
      this.name = name
      this.email = email
    }
  }

  it("caches person instances by name", () => {
    const person1 = new Person("Diego", 31)
    const person2 = new Person("Diego", 32)
    const person3 = new Person("Dieg", 31)

    expect(person1).to.equal(person2)
    expect(person1).to.not.equal(person3)
  })

  it("caches employee instances by email", () => {
    const employee1 = new Employee("Diego", "drborges.cic@gmail.com")
    const employee2 = new Employee("Diego", "drborges.cic@gmail.com")
    const employee3 = new Employee("Diego", "drborges@gmail.com")

    expect(employee1).to.equal(employee2)
    expect(employee1).to.not.equal(employee3)
  })
})
