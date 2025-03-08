/**
 * @class
 * @extends Map
 */
export default class ObservableMap extends Map {
  constructor() {
    super();
    this._callbacks = new Set(); // Store callbacks
  }

  /**
   * Add a callback to be triggered on changes
   * @param {Function} callback
   */
  addCallback(callback) {
    this._callbacks.add(callback);
  }

  /**
   * Remove a callback
   * @param {Function} callback
   */
  removeCallback(callback) {
    this._callbacks.delete(callback);
  }

  /**
   * Trigger all registered callbacks
   * @param {string} action - The action that caused the change (e.g., 'set', 'delete')
   * @param {*} key - The key that was modified
   * @param {*} value - The value that was set (if applicable)
   */
  _triggerCallbacks(action, key, value) {
    for (const callback of this._callbacks) {
      callback(action, key, value);
    }
  }

  // Override Map methods to trigger callbacks
  set(key, value) {
    super.set(key, value);
    this._triggerCallbacks('set', key, value);
    return this;
  }

  delete(key) {
    const result = super.delete(key);
    if (result) {
      this._triggerCallbacks('delete', key, undefined);
    }
    return result;
  }

  get(key) {
    return super.get(key);
  }

  clear() {
    super.clear();
    this._triggerCallbacks('clear', undefined, undefined);
  }
}