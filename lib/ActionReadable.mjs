import {
  Readable
}
from 'stream'
import defaultOption from './defaultOption.mjs';

/**
 * Convert events from views to actions.
 */
export default class extends Readable {
  /**
   * A sub class must set the `name` field.
   * @param {?string} selector - This is selector to specfy the view.
   * @param {?object} option - This is passed to the super class.
   */
  constructor(selector, option) {
    super(Object.assign({}, defaultOption, option))

    this._bindComponent(selector, (action) => {
      console.assert(this.name, '"Steram" MUST has the name property when push an "action".')
      console.assert(action.target, 'An "action" MUST has the "target" property.')
      console.assert(action.type, 'An "action" MUST has the "type" property.')

      action = Object.assign({}, action, {
        source: [this.name]
      })

      if (!this.push(action))
        throw new Error('The stream is clogged.')
    })
  }

  /**
   * this method must be overridden by sub class.
   * @protected
   * @abstract
   * @param {?string} selector - This is the first parameter of the constructor.
   * @param {!function(action: Action)} push - A callback function to push a new Action.
   */
  _bindComponent(selector, push) {}
  _read() {}
}
