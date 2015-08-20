import {
  Writable
}
from 'stream'

import option from './defaultOption';

/**
 * Terminate streams.
 */
export default class extends Writable {
  /**
   * @param {?bool} debug - Print out passing actions to console.log if true.
   */
  constructor(debug) {
    super(option)

    this._debug = debug
  }
  _write(action, encoding, done) {
    if (this._debug)
      console.log('TailStream', action);
    done()
  }
}
