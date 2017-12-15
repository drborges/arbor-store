const Enzyme = require("enzyme")
const chai = require("chai")
const sinonChai = require("sinon-chai")
const chaiEnzyme = require("chai-enzyme")
const Adapter = require("enzyme-adapter-react-16")

Enzyme.configure({ adapter: new Adapter() });

chai.use(chaiEnzyme())
chai.use(sinonChai)
