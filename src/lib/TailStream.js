import {
  Writable
}
from 'stream'

import option from './defaultOption';
export default class extends Writable {
  constructor(debug) {
    super(option)

    this._debug = debug
  }
  _write(action, encoding, done) {
    if (this._debug)
      console.debug('TailStream', action);
    done()
  }
}
