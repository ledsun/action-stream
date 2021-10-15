import {
  Transform
}
from 'stream'
import defaultOption from './defaultOption.mjs';

/**
 * Combine actions from multi views to one Steram.
 */
export default class extends Transform {
  /**
   * @param {?bool} debug - Print out passing actions to console.log if true.
   * @param {?object} option - This is passed to the super class.
   */
  constructor(debug, option) {
    super(Object.assign({}, defaultOption, option))

    this._debug = debug
  }
  _transform(action, encoding, done) {
    if (this._debug)
      console.log('FunnelStream', action)

    if (!this.push(action))
      throw new Error('The stream is clogged.')

    done()
  }
}
