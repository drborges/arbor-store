import PTree from "../ptree"
import Model from "../mtree/model"
import Registry from "../mtree/registry"

export default class MTree extends PTree {
  registry = new Registry

  constructor(initialState, options) {
    super(initialState, options)
  }

  create(path, value, children = {}) {
    const node = super.create(path, value, children)
    return this.wrapped(node)
  }

  wrapped(proxy) {
    const Model = this.registry && this.registry.fetch(proxy.$path)
    return Model ? new Model(proxy) : proxy
  }

  bind(Type) {
    const model = Model(Type)
    return {
      to: (...paths) => {
        paths.forEach(path => this.registry.register(path, model))
      }
    }
  }
}
