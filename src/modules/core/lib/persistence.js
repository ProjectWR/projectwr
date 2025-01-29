import { IndexeddbPersistence } from "y-indexeddb";

let instance;

class PersistenceManager {
  constructor() {
    if (instance) {
      throw new Error(
        "PersistenceManager is a singleton class. Use getInstance() instead."
      );
    }

    /***
     *
     * @type {IndexeddbPersistence | null}
     */
    this.indexeddbProvider = null;
    instance = this;
  }

  getProvider() {
    if (!this.indexeddbProvider) {
      throw new Error("No provider initialized");
    }

    return this.indexeddbProvider;
  }

  initLocalPersistence(ydoc) {
    if (!ydoc) {
      throw new Error("Yjs document is required to initialize persistence");
    }

    this.indexeddbProvider = new IndexeddbPersistence("projectwr_persistence", ydoc);
    this.indexeddbProvider.on("synced", () => {
      console.log("content from the database is loaded");
    });
  }

  closeConnection() {
    if (!this.indexeddbProvider) {
      throw new Error("No connection to close");
    }

    this.indexeddbProvider.destroy();
  }

  clearLocalPersistence() {
    this.indexeddbProvider.clearData();
  }
}

const persistenceManager = Object.freeze(new PersistenceManager());

export default persistenceManager;
