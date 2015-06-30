import {
  Transform
}
from 'stream'
import extend from 'xtend'
import defaultOption from './defaultOption';

export default class extends Transform {
  constructor(option) {
    super(extend(defaultOption, option))
    this._distpatcher = new Map()
  }
  _transform(action, encoding, callback) {
    console.assert(Array.isArray(action.source), '"aciton" MUST has the source property as array.')
    console.assert(action.target, 'An "action" MUST has the "target" property.')
    console.assert(action.type, 'An "action" MUST has the "type" property.')

    let results = []
    if (this._distpatcher[action.target] && this._distpatcher[action.target][action.type])
      this._distpatcher[action.target][action.type](action, results.push.bind(results))
    this._transformAction(action, results.push.bind(results))

    if (!this.push(extend(action)))
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
  // deprecated function.
  _transformAction(action, push) {
  }
  bindAction(target, actionType, handler) {
    if (!this._distpatcher[target])
      this._distpatcher[target] = new Map()

    this._distpatcher[target][actionType] = handler
  }
  bindActions(target, handlers) {
    for (let [actionType, handler] of handlers) {
      this.bindAction(target, actionType, handler)
    }
  }
}
