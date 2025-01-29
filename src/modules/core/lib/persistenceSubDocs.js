import { IndexeddbPersistence } from "y-indexeddb";

let instance;

class PersistenceManagerForSubdocs {
  constructor() {
    if (instance) {
      throw new Error(
        "PersistenceManagerForSubdocs is a singleton class. Use getInstance() instead."
      );
    }

    /***
     *
     * @type {Map<string, IndexeddbPersistence>}
     */
    this.indexeddbProviderMap = new Map();
    instance = this;
  }

  getProviderMap() {
    if (!this.indexeddbProviderMap) {
      throw new Error("No providerMap initialized");
    }

    return this.indexeddbProviderMap;
  }

  initLocalPersistenceForYDoc(ydoc) {
    if (!ydoc) {
      throw new Error("Yjs document is required to initialize persistence");
    }

    if (this.indexeddbProviderMap.has(ydoc.guid)) return;

    this.indexeddbProviderMap.set(
      ydoc.guid,
      new IndexeddbPersistence(ydoc.guid, ydoc)
    );

    this.indexeddbProviderMap.get(ydoc.guid).on("synced", () => {
      console.log("ydoc synced: ", ydoc.toJSON());
    });
  }

  closeConnectionForYDoc(ydoc) {
    if (!this.indexeddbProviderMap) {
      throw new Error("No Map ");
    }

    this.indexeddbProviderMap.get(ydoc.guid).destroy();
  }

  clearLocalPersistence() {
    this.indexeddbProviderMap.forEach((idb) => idb.clearData());
  }

  clearLocalPersistenceForYDoc(ydoc) {
    if (!this.indexeddbProviderMap) {
      throw new Error("No Map");
    }

    this.indexeddbProviderMap.get(ydoc.guid).clearData();
  }

  async clearAllPersistence() {
    const dbs = await window.indexedDB.databases();
    dbs.forEach((db) => {
      console.log('db to be deleted:  ', db);
      window.indexedDB.deleteDatabase(db.name);
    });
  }
}

const persistenceManagerForSubdocs = Object.freeze(
  new PersistenceManagerForSubdocs()
);

export default persistenceManagerForSubdocs;
