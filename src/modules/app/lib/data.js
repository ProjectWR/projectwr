import * as Y from "yjs";
import { generateUUID } from "../utils/uuidUtil";
import { getHighestOrderIndex, insertBetween } from "../utils/orderUtil";

let instance;

/**
 * @type {Y.Doc | null}
 * @description Yjs document instance for collaborative editing.
 */
let ydoc = null;

class DataManager {
  constructor() {
    if (instance) {
      throw new Error(
        "DataManager is a singleton class. Use getInstance() instead."
      );
    }

    this.initCRDT();
    instance = this;
  }

  initCRDT(guid) {
    if (!ydoc) {
      ydoc = new Y.Doc({
        guid: "123e4567-e89b-12d3-a456-426614174000" /* guid placeholder */,
        autoload: true,
      });
      generateUUID();

      console.log("CRDT initialized");
    } else {
      console.log("CRDT already initialized");
    }
  }

  getYDoc() {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    return ydoc;
  }

  fetchOrInitLibraries() {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    return ydoc.getMap("user-libraries-map");
  }

  createEmptyLibrary(libraryProperties) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    const userLibrariesMap = this.fetchOrInitLibraries();

    const libraryEntry = new Y.Map();
    const uuid = generateUUID();
    libraryEntry.set("library_id", uuid);
    libraryEntry.set("library_name", libraryProperties.library_name);
    libraryEntry.set(
      "library_description",
      libraryProperties.library_description
    );
    libraryEntry.set(
      "order_index",
      insertBetween(
        getHighestOrderIndex(Object.entries(userLibrariesMap.toJSON())),
        ""
      )
    );
    libraryEntry.set("items-map", new Y.Map());

    this.createItemsMap(libraryEntry);

    userLibrariesMap.set(uuid, libraryEntry);

    return this.fetchLibraryEntry(uuid);
  }

  fetchLibraryEntry(libraryUUID) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    const userLibrariesMap = this.fetchOrInitLibraries();

    if (!userLibrariesMap) {
      throw new Error(
        "User libraries Map not initialized. Call FetchOrInitLibraries() first."
      );
    }

    if (!userLibrariesMap.has(libraryUUID)) {
      throw new Error("Library not found.");
    }

    return userLibrariesMap.get(libraryUUID);
  }

  fetchItem(entry, itemUUID) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    const itemsMap = this.fetchItemsMap(entry);

    if (!itemsMap) {
      throw new Error("Items map not initialized.");
    }

    if (!itemsMap.has(itemUUID)) {
      throw new Error("Item not found.");
    }

    return itemsMap.get(itemUUID);
  }

  createBookItem(entry, bookProperties) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    if (!entry) {
      throw new Error("Entry not initialized.");
    }

    const itemsMap = entry.get("items-map");

    if (!itemsMap) {
      throw new Error("Items Map not initialized.");
    }

    const bookEntry = new Y.Map();

    const uuid = generateUUID();
    bookEntry.set("item_id", uuid);
    bookEntry.set("title", bookProperties.title);
    bookEntry.set("type", "book");
    bookEntry.set("description", bookProperties.description);
    bookEntry.set(
      "order_index",
      insertBetween(getHighestOrderIndex(Object.entries(itemsMap.toJSON())), "")
    );

    this.createItemsMap(bookEntry);
    itemsMap.set(uuid, bookEntry);

    return itemsMap.get(uuid);
  }

  createPaperItem(entry, paperProperties) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    if (!entry) {
      throw new Error("Entry not initialized.");
    }

    const itemsMap = this.fetchItemsMap(entry);

    if (!itemsMap) {
      throw new Error("Items Map not initialized.");
    }

    const uuid = generateUUID();

    const itemEntry = new Y.Map();
    itemEntry.set("item_id", uuid);
    itemEntry.set("title", paperProperties.title);
    itemEntry.set("type", "paper");
    itemEntry.set("paper-text", new Y.XmlText());
    itemEntry.set(
      "order_index",
      insertBetween(getHighestOrderIndex(Object.entries(itemsMap.toJSON())), "")
    );

    return itemsMap.set(uuid, itemEntry);
  }

  createYDocPaperItem(entry, paperProperties) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    if (!entry) {
      throw new Error("Entry not initialized.");
    }

    const itemsMap = this.fetchItemsMap(entry);

    if (!itemsMap) {
      throw new Error("Items Map not initialized.");
    }

    const uuid = generateUUID();

    const itemEntry = new Y.Map();
    itemEntry.set("item_id", uuid);
    itemEntry.set("title", paperProperties.title);
    itemEntry.set("type", "paper");
    itemEntry.set("paper-ydoc", new Y.Doc({ guid: uuid }));
    itemEntry.set(
      "order_index",
      insertBetween(getHighestOrderIndex(Object.entries(itemsMap.toJSON())), "")
    );

    return itemsMap.set(uuid, itemEntry);
  }


  createSectionItem(entry, sectionProperties) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    if (!entry) {
      throw new Error("Entry not initialized.");
    }

    const itemsMap = this.fetchItemsMap(entry);

    if (!itemsMap) {
      throw new Error("Items Map not initialized.");
    }

    const uuid = generateUUID();

    const itemEntry = new Y.Map();
    itemEntry.set("item_id", uuid);
    itemEntry.set("title", sectionProperties.title);
    itemEntry.set("type", "section");
    itemEntry.set("prefix", sectionProperties.prefix);
    itemEntry.set("open", false);
    itemEntry.set(
      "order_index",
      insertBetween(getHighestOrderIndex(Object.entries(itemsMap.toJSON())), "")
    );

    this.createItemsMap(itemEntry);
    return itemsMap.set(uuid, itemEntry);
  }

  deleteItemEntry(item_id, srcEntry) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    if (!srcEntry) {
      throw new Error("Papers Map not initialized.");
    }

    const srcItemsMap = srcEntry.get("items-map");

    if (!srcItemsMap) {
      throw new Error("Papers Map not initialized");
    }

    srcItemsMap.delete(item_id);
  }

  copyItemEntry(item_id, srcEntry, destEntry) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    if (!srcEntry || !destEntry) {
      throw new Error("Papers Map not initialized.");
    }

    const srcItemsMap = srcEntry.get("items-map");
    const destItemsMap = destEntry.get("items-map");

    if (!srcItemsMap || !destItemsMap) {
      throw new Error("Papers Map not initialized");
    }

    const itemEntry = srcItemsMap.get(item_id).clone();
    const new_item_id = generateUUID();
    itemEntry.set("item_id", new_item_id);

    if (!itemEntry) {
      throw new Error("Item not found in source entry.");
    }

    destItemsMap.set(new_item_id, itemEntry);
  }

  setOrderOfItemEntry(item_id, entry, before, after) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    console.log("entry: ", entry, "before: ", before, "after: ", after);
    console.log(
      "Type of entry: ",
      typeof entry,
      "Type of before: ",
      typeof before,
      "Type of after: ",
      typeof after
    );

    if (!entry || (!before && before !== "") || (!after && after !== "")) {
      throw new Error("Improper arguments");
    }

    console.log("SEEIONG ENTRY INSIDE SOOE: ", entry);

    const itemsMap = this.fetchItemsMap(entry);

    if (!itemsMap) {
      throw new Error("Items Map not initialized.");
    }

    const itemEntry = itemsMap.get(item_id);

    if (!itemEntry) {
      throw new Error("Item not found.");
    }

    itemEntry.set("order_index", insertBetween(before, after));
  }

  setOrderOfLibraryEntry(library_id, entry, before, after) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    console.log("entry: ", entry, "before: ", before, "after: ", after);
    console.log(
      "Type of entry: ",
      typeof entry,
      "Type of before: ",
      typeof before,
      "Type of after: ",
      typeof after
    );

    if (!entry || (!before && before !== "") || (!after && after !== "")) {
      throw new Error("Improper arguments");
    }

    console.log("SEEIONG ENTRY INSIDE SOOE: ", entry);

    const libraryEntry = entry.get(library_id);

    if (!libraryEntry) {
      throw new Error("Item not found.");
    }

    libraryEntry.set("order_index", insertBetween(before, after));
  }

  fetchItemsMap(yMap) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    if (!yMap) {
      throw new Error("Entry not initialized.");
    }

    const itemsMap = yMap.get("items-map");

    if (!itemsMap) {
      throw new Error("Items map not initialized.");
    }

    return itemsMap;
  }

  createItemsMap(entry) {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    if (!entry) {
      throw new Error("map not initialized.");
    }

    entry.set("items-map", new Y.Map());
  }

  /* DELETE FUNCTONS */
  deleteYDoc() {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    const yMap = ydoc.getMap("user-libraries-map");
    console.log("DELETING YDOC!: ", yMap);

    console.log(yMap.keys());

    for (const key of yMap.keys()) {
      console.log("Deleting key: ", key);
      yMap.delete(key);
    }

    ydoc.destroy();
  }

  /* subdoc functions */

  getAllSubdocs() {
    if (!ydoc) {
      throw new Error("CRDT not initialized. Call initCRDT() first.");
    }

    const arr = new Array();
    const yMap = this.fetchOrInitLibraries();
    this.getAllSubdocsHelper(yMap, arr);
    return arr;
  }

  getAllSubdocsHelper(yMap, arr) {
    yMap.forEach((value, key) => {
      if (key === "paper-ydoc") {
        arr.push(value);
      } else if (value instanceof Y.Map) {
        this.getAllSubdocsHelper(value, arr);
      }
    });
  }
}

const dataManager = Object.freeze(new DataManager());

export default dataManager;
