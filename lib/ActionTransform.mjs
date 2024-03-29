import {
  Transform
}
from 'stream'
import defaultOption from './defaultOption.mjs';

/**
 * Call models or views according to recived actions.
 */
export default class extends Transform {
  /**
   * @param {?object} option - this is passed to the super class.
   */
  constructor(option) {
    super(Object.assign({}, defaultOption, option))
    this._distpatcher = new Map()
  }
  _transform(action, encoding, callback) {
    console.assert(Array.isArray(action.source), '"aciton" MUST has the source property as array.')
    console.assert(action.target, 'An "action" MUST has the "target" property.')
    console.assert(action.type, 'An "action" MUST has the "type" property.')

    let results = [],
      addResult = (newAction) => results.push(Promise.resolve(newAction))

    if (this._distpatcher[action.target] && this._distpatcher[action.target].has(action.type)) {
      this._distpatcher[action.target].get(action.type)
        .forEach(func => func(action, addResult))
    }

    if (!this.push(Object.assign({}, action)))
      throw new Error('The stream is clogged.')

    if (results.length > 0) {
      console.assert(this.name, '"Steram" MUST has the name property when push another "action".')

      results.forEach(
        r => r.then(
          newAction => pushAction(this, action, newAction)
        )
      )
    }

    callback()
  }
  /**
   * Bind calback functions to `Action`s.
   *
   * @param {!string} target - The target stream will recive actions.
   * @param {!ActionBinding[]} handlers - A set of action type and action handlers.
   */
  bindActions(target, handlers) {
    console.assert(Array.isArray(handlers), '"handlers" MUST be an array.')
    console.assert(handlers.length, '"handlers" MUST contain at least one handler.')
    console.assert(Array.isArray(handlers[0]), '"handlers" MUST has array like [actionType, handler].')

    for (let [actionType, handler] of handlers) {
      console.assert(typeof handler === 'function', '"handler" MUST be a function')

      bindAction(this._distpatcher, target, actionType, handler)
    }
  }
}

function pushAction(self, sourceAction, newAction) {
  // Forwad action to new target when newAction is string.
  if (typeof newAction === 'string') {
    newAction = {
      target: newAction
    }
  }

  newAction.source = sourceAction.source.concat([self.name])

  if (!self.push(Object.assign({}, sourceAction, newAction)))
    throw new Error('The stream is clogged.')
}

function bindAction(distpatcher, target, actionType, handler) {
  if (!distpatcher[target])
    distpatcher[target] = new Map()

  if (!distpatcher[target].has(actionType)) {
    distpatcher[target].set(actionType, [handler])
  } else {
    distpatcher[target].get(actionType).push(handler)
  }
}

/**
 * Push function is a callback function to push an additional `Action`.
 * @typedef {function(newAction: object)} PushFunction
 * @property {string|object|Promise} newAction - 1. A target of an additional `Action` if string.
 * 1. An additional `Action` if object.
 * 1. A Promise return An additional `Action` if Promise.
 */

/**
 * `Action` handler is a callback function for `Action`.
 * @typedef {function(action: Action, push: PushFunction)} ActionHandler
 * @property {Action} action - A recived action.
 * @property {PushFunction} push - A callback to push an additional `Action`. This supprots `Promise`.
 */

/**
 * A set of action type and action handlers.
 * @typedef {Array} ActionBinding
 * @property {!string} Item[0] - A action type to bind a `ActionHandler`.
 * @property {!ActionHandler} Item[1] - handlers that has arguments of action and function.
 */
