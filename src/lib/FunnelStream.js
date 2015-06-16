import {
  Transform
}
from 'stream'
import option from './defaultOption';

export default class extends Transform {
  constructor(debug) {
    super(option)

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
