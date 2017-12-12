const chai = require("chai")
const sinonChai = require("sinon-chai")
const chaiEnzyme = require("chai-enzyme")

chai.use(chaiEnzyme())
chai.use(sinonChai)
