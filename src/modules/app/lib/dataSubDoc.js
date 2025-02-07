import * as Y from "yjs";
import { generateUUID } from "../utils/uuidUtil";
import { getHighestOrderIndex, insertBetween } from "../utils/orderUtil";
import { YTree } from "yjs-orderedtree";
import persistenceManagerForSubdocs from "./persistenceSubDocs";
import { fetchUserLibraryListStore } from "./libraries";
import { IndexeddbPersistence } from "y-indexeddb";

class ObservableMap extends Map {
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

  clear() {
    super.clear();
    this._triggerCallbacks('clear', undefined, undefined);
  }
}

let instance;

class DataManagerSubdocs {
  constructor() {
    if (instance) {
      throw new Error(
        "DataManagerSubdocs is a singleton class. Use getInstance() instead."
      );
    }

    /**
     * @type {ObservableMap<string, Y.Doc>}
     */
    this.libraryYDocMap = new ObservableMap(); // Use ObservableMap
    instance = this;
  }

  /**
   * Add a callback to be triggered when the libraryYDocMap changes
   * @param {Function} callback
   */
  addLibraryYDocMapCallback(callback) {
    this.libraryYDocMap.addCallback(callback);
  }

  /**
   * Remove a callback
   * @param {Function} callback
   */
  removeLibraryYDocMapCallback(callback) {
    this.libraryYDocMap.removeCallback(callback);
  }

  /**
   * Initialize a library with a new Y.Doc
   * @param {string} libraryId
   */
  initLibrary(libraryId) {

    if (this.libraryYDocMap.has(libraryId)) {
      console.log("library already intitiated: ", libraryId);
      return;
    }

    const ydoc = new Y.Doc({ guid: libraryId });
    ydoc.getMap("library_props");
    ydoc.getMap("library_directory");
    this.libraryYDocMap.set(libraryId, new Y.Doc({ guid: libraryId }));
  }

  /**
   * Destroy a library by removing its Y.Doc from the map
   * @param {string} libraryId
   */
  destroyLibrary(libraryId) {
    this.libraryYDocMap.delete(libraryId);
  }

  /**
   * Get a library Y.Doc by its ID
   * @param {string} libraryId
   * @returns {Y.Doc}
   */
  getLibrary(libraryId) {
    return this.libraryYDocMap.get(libraryId);
  }

  /**
   * Create an empty library with default properties
   */
  createEmptyLibrary() {
    const uuid = generateUUID();
    const ydoc = new Y.Doc({ guid: uuid });

    const libraryPropertiesYMap = ydoc.getMap("library_props");
    libraryPropertiesYMap.set("library_name", "Library Name");
    libraryPropertiesYMap.set(
      "library_description",
      "Library Description"
    );

    libraryPropertiesYMap.set(
      "order_index",
      insertBetween(
        getHighestOrderIndex(getArrayFromYDocMap(this.libraryYDocMap)),
        ""
      )
    );

    const libraryDirectoryYTree = new YTree(ydoc.getMap("library_directory"));

    this.libraryYDocMap.set(uuid, ydoc);
    persistenceManagerForSubdocs.initLocalPersistenceForYDoc(ydoc);

    (async () => {
      console.log("starting to put library in store");
      const librariesStore = await fetchUserLibraryListStore();
      await librariesStore.set(uuid, "");
      console.log("set library in store");
    })();
  }

  /**
   * 
   * @param {YTree} ytree 
   * @returns {string}
   */
  createEmptyBook(ytree) {
    const uuid = generateUUID();
    const bookMap = new Y.Map();
    bookMap.set("type", "book");
    bookMap.set("item_id", uuid);
    bookMap.set("item_title", "Book Title");
    bookMap.set("book_description", "Book Description");
    ytree.createNode("root", uuid, bookMap);

    return uuid;
  }

  /**
   * 
   * @param {YTree} ytree 
   * @param {string} bookId 
   */
  createEmptySection(ytree, bookId) {
    const uuid = generateUUID();
    const sectionMap = new Y.Map();
    sectionMap.set("type", "section");
    sectionMap.set("item_id", uuid);
    sectionMap.set("item_title", "Section Title");
    sectionMap.set("section_description", "Section Description")
    ytree.createNode(bookId, uuid, sectionMap);
  }

  /**
   * 
   * @param {YTree} ytree 
   * @param {string} parentId 
   */
  createEmptyPaper(ytree, parentId) {
    const uuid = generateUUID();
    const paperMap = new Y.Map();
    paperMap.set("type", "paper");
    paperMap.set("item_id", uuid);
    paperMap.set("item_title", "Paper Title");
    paperMap.set("paper_xml", new Y.XmlFragment());
    ytree.createNode(parentId, uuid, paperMap);
  }
}

const dataManagerSubdocs = Object.freeze(new DataManagerSubdocs());

export default dataManagerSubdocs;

/**
 * Convert a Y.Doc Map to an array of [id, order_index] pairs
 * @param {Map<string, Y.Doc>} ydocMap
 */
export function getArrayFromYDocMap(ydocMap) {
  const array = new Array();

  for (const [id, ydoc] of ydocMap.entries()) {
    if (ydoc.getMap("library_props").has("order_index")) {
      array.push([id, ydoc.getMap("library_props").get("order_index")]);
    }
  }

  return array;
}
