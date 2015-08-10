import {
  Transform
}
from 'stream'
import extend from 'xtend'
import defaultOption from './defaultOption';

/**
 * Combine actions from multi views to one Steram.
 */
export default class extends Transform {
  /**
   * @param {?bool} debug - Print out passing actions to console.debug if true.
   * @param {?object} option - This is passed to the super class.
   */
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
