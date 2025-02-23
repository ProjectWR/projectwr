import { IndexeddbPersistence } from "y-indexeddb";
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeFile, readFile } from '@tauri-apps/plugin-fs';
import { Buffer } from 'buffer/';
import * as Y from "yjs";
import dataManagerSubdocs, { getArrayFromYDocMap } from "./dataSubDoc";
import { getHighestOrderIndex, getNextOrderIndex, insertBetween } from "../utils/orderUtil";



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

  async initLocalPersistenceForYDoc(ydoc) {
    if (!ydoc) {
      throw new Error("Yjs document is required to initialize persistence");
    }

    this.indexeddbProviderMap.set(
      ydoc.guid,
      new IndexeddbPersistence(ydoc.guid, ydoc)
    );

    await new Promise((resolve) => {
      this.indexeddbProviderMap.get(ydoc.guid).whenSynced.then(() => {
        resolve();
      });
    });
  }

  async closeConnectionForYDoc(ydoc) {
    await this.indexeddbProviderMap.get(ydoc.guid).destroy();
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


  /**
   * Save the current IndexedDB archive for the given ydoc.
   * This function reads every object store from the DB, stringifies the data
   * using a replacer to preserve Uint8Array and ArrayBuffer objects, and saves
   * the archive to a file.
   *
   * @param {Object} ydoc - The Yjs document.
   */
  async saveArchive(ydoc) {
    try {
      const provider = this.indexeddbProviderMap.get(ydoc.guid);
      if (!provider) {
        throw new Error("IndexedDB provider not found for the given ydoc.");
      }
      const db = provider.db;
      const archiveData = {};

      // Get all object store names as an array
      const storeNames = Array.from(db.objectStoreNames);

      // Open a readonly transaction for all stores
      const transaction = db.transaction(storeNames, "readonly");

      // For each store, collect all its records
      const storePromises = storeNames.map(
        (storeName) =>
          new Promise((resolve, reject) => {
            const store = transaction.objectStore(storeName);
            const storeData = [];
            const request = store.openCursor();
            request.onsuccess = (event) => {
              const cursor = event.target.result;
              if (cursor) {
                storeData.push(cursor.value);
                cursor.continue();
              } else {
                archiveData[storeName] = storeData;
                resolve();
              }
            };
            request.onerror = (event) => reject(event.target.error);
          })
      );

      // Wait for all stores to be read
      await Promise.all(storePromises);
      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = reject;
      });

      // Serialize the data while preserving typed arrays
      const jsonString = JSON.stringify(archiveData, typedArrayReplacer);
      // Encode the JSON string to a binary buffer
      const buffer = new TextEncoder().encode(jsonString);

      // Prompt user to select a file path for saving (.twlibarch extension)
      const path = await save({
        filters: [{ name: "Archive", extensions: ["twlibarch"] }],
      });
      if (!path) {
        console.log("Save operation cancelled by user.");
        return;
      }

      // Write the buffer to the selected file path
      await writeFile(path, buffer);
      console.log(`Archive saved at: ${path}`);
    } catch (error) {
      console.error("Error while saving archive:", error);
    }
  }

  /**
   * Load an archive from a file and restore the IndexedDB data for the given ydoc.
   * First, the function clears all data in every object store of the current DB
   * without destroying the DB connection or local persistence.
   *
   * @param {Y.Doc} ydoc - The Yjs document.
   */
  async loadArchive(ydoc) {
    try {
      const provider = this.indexeddbProviderMap.get(ydoc.guid);
      if (!provider) {
        throw new Error("IndexedDB provider not found for the given ydoc.");
      }
      const db = provider.db;

      // Prompt the user to select the archive file
      const path = await open({
        filters: [{ name: "Archive", extensions: ["twlibarch"] }],
      });
      if (!path) {
        console.log("Load operation cancelled by user.");
        return;
      }

      // Read and decode the archive file
      const buffer = await readFile(path);
      const jsonString = new TextDecoder().decode(buffer);
      const archiveData = JSON.parse(jsonString, typedArrayReviver);

      // Clear existing data from all object stores in the DB without destroying the connection.
      const allStoreNames = Array.from(db.objectStoreNames);
      const clearTransaction = db.transaction(allStoreNames, "readwrite");
      for (const storeName of allStoreNames) {
        const store = clearTransaction.objectStore(storeName);
        await new Promise((resolve, reject) => {
          const clearReq = store.clear();
          clearReq.onsuccess = resolve;
          clearReq.onerror = (e) => reject(e);
        });
      }
      await new Promise((resolve, reject) => {
        clearTransaction.oncomplete = resolve;
        clearTransaction.onerror = reject;
      });

      // Now, restore data from the archive.
      const archiveStoreNames = Object.keys(archiveData);
      const restoreTransaction = db.transaction(archiveStoreNames, "readwrite");
      for (const storeName of archiveStoreNames) {
        // If the store doesn't exist in the current DB, skip it.
        if (!db.objectStoreNames.contains(storeName)) {
          console.warn(`Object store "${storeName}" not found in the current DB; skipping.`);
          continue;
        }
        const store = restoreTransaction.objectStore(storeName);
        // Insert each record from the archive
        for (const record of archiveData[storeName]) {
          await new Promise((resolve, reject) => {
            const addReq = store.add(record);
            addReq.onsuccess = resolve;
            addReq.onerror = (e) => reject(e);
          });
        }
      }
      await new Promise((resolve, reject) => {
        restoreTransaction.oncomplete = resolve;
        restoreTransaction.onerror = reject;
      });

      console.log(`Archive loaded successfully from: ${path}`);

      const orderIndex = ydoc.getMap("library_props").get("order_index");

      const guid = ydoc.guid;
      await this.closeConnectionForYDoc(ydoc);
      dataManagerSubdocs.destroyLibrary(guid);

      const newYDoc = new Y.Doc({ guid: guid });
      await this.initLocalPersistenceForYDoc(newYDoc);

      dataManagerSubdocs.libraryYDocMap.set(guid, newYDoc);

      const libraryPropertiesYMap = newYDoc.getMap("library_props");

      libraryPropertiesYMap.set(
        "order_index",
        orderIndex
      );

    } catch (error) {
      console.error("Error while loading archive:", error);
    }


  }
}

const persistenceManagerForSubdocs = Object.freeze(
  new PersistenceManagerForSubdocs()
);

export default persistenceManagerForSubdocs;

/**
 * Custom JSON replacer to preserve Uint8Array and ArrayBuffer objects.
 *
 * @param {string} key
 * @param {*} value
 * @returns {*} Transformed value with type metadata if applicable.
 */
function typedArrayReplacer(key, value) {
  if (value instanceof Uint8Array) {
    return {
      __typedarray__: "Uint8Array",
      data: Array.from(value),
    };
  }
  if (value instanceof ArrayBuffer) {
    return {
      __typedarray__: "ArrayBuffer",
      data: Array.from(new Uint8Array(value)),
    };
  }
  return value;
}

/**
 * Custom JSON reviver to restore Uint8Array and ArrayBuffer objects.
 *
 * @param {string} key
 * @param {*} value
 * @returns {*} Original typed object if metadata is detected.
 */
function typedArrayReviver(key, value) {
  if (value && value.__typedarray__ === "Uint8Array") {
    return new Uint8Array(value.data);
  }
  if (value && value.__typedarray__ === "ArrayBuffer") {
    return new Uint8Array(value.data).buffer;
  }
  return value;
}