import {
  Transform
}
from 'stream'
import extend from 'xtend'
import defaultOption from './defaultOption';

export default class extends Transform {
  constructor(debug, option) {
    super(extend(defaultOption, option))

    this._debug = debug
  }
  _transform(action, encoding, done) {
    if (this._debug)
      console.debug('FunnelStream', action)

    if (!this.push(action))
      throw new Error('The stream is clogged.')

    done()
  }
}
