import {
  Readable
}
from 'stream'
import option from './defaultOption';

export default class extends Readable {
  constructor(selector) {
    super(option)
    this._bindComponent(selector, (action) => {
      console.assert(this.name, '"Steram" MUST has the name property when push an "action".')
      console.assert(action.target, 'An "action" MUST has the "target" property.')
      console.assert(action.type, 'An "action" MUST has the "type" property.')

      action.source = [this.name]
      if (!this.push(action))
        throw new Error('The stream is clogged.')
    })
  }
  _bindComponent(selector, push) {}
  _read() {}
}
