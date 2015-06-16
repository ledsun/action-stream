import {
  Transform
}
from 'stream'
import extend from 'xtend'
import option from './defaultOption';

export default class extends Transform {
  constructor() {
    super(option)
  }
  _transform(action, encoding, callback) {
    console.assert(Array.isArray(action.source), '"aciton" MUST has the source property as array.')
    console.assert(action.target, 'An "action" MUST has the "target" property.')
    console.assert(action.type, 'An "action" MUST has the "type" property.')

    let results = []
    this._transformAction(action, results.push.bind(results))

    if (!this.push(action))
      throw new Error('The stream is clogged.')

    if (results.length > 0) {
      console.assert(this.name, '"Steram" MUST has the name property when push another "action".')

      results.forEach(r => {
        r.source = action.source.concat([this.name])
        if (!this.push(extend(action, r)))
          throw new Error('The stream is clogged.')
      })
    }

    callback()
  }
  _transformAction(action, push) {
    throw new Error('not implemented');
  }
}
