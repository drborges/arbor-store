import sinon from "sinon"
import { expect } from "chai"

import cached from "../../src/path/cached"

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
    const person1 = new Person("Jon", 31)
    const person2 = new Person("Jon", 32)
    const person3 = new Person("Snow", 31)

    expect(person1).to.equal(person2)
    expect(person1).to.not.equal(person3)
  })

  it("caches employee instances by email", () => {
    const employee1 = new Employee("Jon", "jon@gmail.com")
    const employee2 = new Employee("Snow", "jon@gmail.com")
    const employee3 = new Employee("Stark", "stark@gmail.com")

    expect(employee1).to.equal(employee2)
    expect(employee1).to.not.equal(employee3)
  })
})
