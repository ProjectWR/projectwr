import { load } from "@tauri-apps/plugin-store";

let instance;

class LocalStateManager {
  constructor() {
    if (instance) {
      throw new Error(
        "LocalStateManager is a singleton class. Use getInstance() instead.",
      );
    }

    this.store = null;
    this.storeKey = "LocalStateStore";
    this.keyListeners = new Map();
    this.allListeners = new Set();
    instance = this;
  }

  async init() {
    if (this.store) return;
    this.store = await load(this.storeKey, { autoSave: true });
  }

  _getKey(libraryId, itemId) {
    return `${libraryId}::${itemId}`;
  }

  _notify(key, value) {
    const callbacks = this.keyListeners.get(key);
    if (callbacks) {
      callbacks.forEach((cb) => cb(value));
    }
    this.allListeners.forEach((cb) => cb(key, value));
  }

  /**
   * Retrieves the local state for a specific item.
   * @param {string} libraryId
   * @param {string} itemId
   * @returns {Promise<{lastOpenedDtm: string | null, editorStyle: string}>}
   */
  async get(libraryId, itemId) {
    await this.init();
    const key = this._getKey(libraryId, itemId);
    const value = await this.store.get(key);
    return value || { lastOpenedDtm: null, editorStyle: "unselected" };
  }

  /**
   * Retrieves all local states.
   * @returns {Promise<Object>}
   */
  async getAll() {
    await this.init();
    const entriesArr = await this.store.entries();
    const all = {};
    for (const [k, v] of entriesArr) {
      all[k] = v;
    }
    return all;
  }

  /**
   * Sets or updates the local state for a specific item.
   * @param {string} libraryId
   * @param {string} itemId
   * @param {Object} data
   */
  async set(libraryId, itemId, data) {
    await this.init();
    const key = this._getKey(libraryId, itemId);
    const current = await this.get(libraryId, itemId);
    const newValue = { ...current, ...data };
    await this.store.set(key, newValue);
    this._notify(key, newValue);
  }

  /**
   * Removes the local state for a specific item.
   * @param {string} libraryId
   * @param {string} itemId
   */
  async delete(libraryId, itemId) {
    await this.init();
    const key = this._getKey(libraryId, itemId);
    await this.store.delete(key);
    this._notify(key, null);
  }

  /**
   * Observes changes to a specific item.
   * @param {string} libraryId
   * @param {string} itemId
   * @param {Function} callback
   */
  observeKey(libraryId, itemId, callback) {
    const key = this._getKey(libraryId, itemId);
    if (!this.keyListeners.has(key)) {
      this.keyListeners.set(key, new Set());
    }
    this.keyListeners.get(key).add(callback);
  }

  /**
   * Stops observing changes to a specific item.
   * @param {string} libraryId
   * @param {string} itemId
   * @param {Function} callback
   */
  unobserveKey(libraryId, itemId, callback) {
    const key = this._getKey(libraryId, itemId);
    if (this.keyListeners.has(key)) {
      this.keyListeners.get(key).delete(callback);
    }
  }

  /**
   * Observes all changes to the store.
   * @param {Function} callback (key, value) => void
   */
  observeAll(callback) {
    this.allListeners.add(callback);
  }

  /**
   * Stops observing all changes.
   * @param {Function} callback
   */
  unobserveAll(callback) {
    this.allListeners.delete(callback);
  }

  /**
   * Convenience method to update the last opened timestamp.
   * @param {string} libraryId
   * @param {string} itemId
   */
  async updateLastOpened(libraryId, itemId) {
    await this.set(libraryId, itemId, {
      lastOpenedDtm: new Date().toISOString(),
    });
  }

  /**
   * Convenience method to update the editor style.
   * @param {string} libraryId
   * @param {string} itemId
   * @param {string} editorStyle
   */
  async updateEditorStyle(libraryId, itemId, editorStyle) {
    await this.set(libraryId, itemId, { editorStyle });
  }

  /**
   * Convenience method to update the paper Scroll Position
   * @param {string} libraryId
   * @param {string} itemId
   * @param {string} editorStyle
   */
  async updatePaperScrollPosition(libraryId, itemId, scrollPos) {
    await this.set(libraryId, itemId, { scrollPos });
  }
}

const localStateManager = new LocalStateManager();

export default localStateManager;
