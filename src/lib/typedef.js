/**
 * Action is an object flowing in the streams.
 * @typedef {object} Action
 * @property {!string} target - The target stream to be recived.
 * @property {!string} actyonType - The type of an `Action`.
 * @property {string[]} source - The sorce streams of an `Action`.
 */

/**
 * Push function is a callback function to push an additional `Action`.
 * @typedef {function(newAction: object)} PushFunction
 * @property {object|Promise} newAction - An additional `Action` or a Promise return An additional `Action`.
 */

/**
 * `Action` handler is a callback function for `Action`.
 * @typedef {function(action: Action, push: PushFunction)} ActionHandler
 * @property {Action} action - A recived action.
 * @property {PushFunction} push - A callback to push an additional `Action`. This supprots `Promise`.
 */
