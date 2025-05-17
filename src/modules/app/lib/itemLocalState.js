import { YTree } from "yjs-orderedtree";
import dataManagerSubdocs from "./dataSubDoc";

let instance;

class ItemLocalStateManager {
  constructor() {
    if (instance) {
      throw new Error("ItemLocalStateManager is a singleton class. Use getInstance() instead.");
    }

    this.storageKey = 'items'; // Key for localStorage
    this.callbacks = new Map(); // Use a Map to store callbacks for specific itemIds
    this.callbacksForAll = new Set();
    instance = this;
  }

  // Register a callback for a specific itemId's isOpened state
  on(itemId, callback) {
    if (!this.callbacks.has(itemId)) {
      this.callbacks.set(itemId, new Set()); // Initialize a Set for the itemId if it doesn't exist
    }
    this.callbacks.get(itemId).add(callback); // Add the callback to the Set
  }

  onAll(callback) {
    this.callbacksForAll.add(callback); // Initialize a Set for the itemId if it doesn't exist
  }

  // Remove a callback for a specific itemId
  off(itemId, callback) {
    if (this.callbacks.has(itemId)) {
      const callbacksForItem = this.callbacks.get(itemId);
      callbacksForItem.delete(callback); // Remove the callback from the Set

      // Clean up the Set if it's empty
      if (callbacksForItem.size === 0) {
        this.callbacks.delete(itemId);
      }
    }
  }

  offAll(callback) {
    this.callbacksForAll.delete(callback); // Initialize a Set for the itemId if it doesn't exist
  }

  // Trigger all callbacks for a specific itemId
  _trigger(itemId, ...args) {
    if (this.callbacks.has(itemId)) {
      this.callbacks.get(itemId).forEach((callback) => callback(...args));
    }
    this.callbacksForAll.forEach((callback) => callback(...args));
  }

  // Get the entire items dictionary from localStorage
  _getItems() {
    const itemsJSON = localStorage.getItem(this.storageKey);
    return itemsJSON ? JSON.parse(itemsJSON) : {};
  }

  // Save the entire items dictionary to localStorage
  _saveItems(items) {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  // Get the paper editor template for a specific item
  getPaperEditorTemplate(itemId) {
    const items = this._getItems();
    return items[itemId]?.props?.EditorTemplate || null;
  }

  // Get the paper editor template for a specific item
  setPaperEditorTemplate(itemId, templateId, libraryId) {
    const items = this._getItems();
    if (items[itemId]) {
      items[itemId].props.EditorTemplate = templateId;
      this._saveItems(items);
      this._trigger(itemId, templateId, items[itemId]); // Trigger callbacks for the specific itemId
    } else {
      console.warn(`Item with ID ${itemId} does not exist.`);
      this.setItemAndParentsOpened(libraryId, itemId);
    }
  }

  // Get the paper editor type for a specific item
  getPaperEditorType(itemId) {
    const items = this._getItems();
    return items[itemId]?.props?.EditorType || null;
  }

  // Check if an item is opened
  isItemOpened(itemId) {
    const items = this._getItems();
    return items[itemId]?.props?.isOpened || false;
  }

  // Set the `isOpened` state of an item
  setItemOpened(itemId, isOpened, libraryId) {
    const items = this._getItems();
    if (items[itemId]?.props.libraryId === libraryId) {
      items[itemId].props.isOpened = isOpened;

      // Update lastOpened timestamp if the item is being opened
      if (isOpened) {
        items[itemId].props.lastOpened = Date.now();
      }

      this._saveItems(items);
      this._trigger(itemId, isOpened, items[itemId]); // Trigger callbacks for the specific itemId

    } else {
      console.warn(`Item with ID ${itemId} does not exist.`);
      this.setItemAndParentsOpened(libraryId, itemId);
    }
  }

  // Get the lastOpened timestamp for a specific item
  getLastOpened(itemId) {
    const items = this._getItems();
    return items[itemId]?.props?.lastOpened || null;
  }

  // Set the lastOpened timestamp for a specific item
  setLastOpened(itemId, timestamp) {
    const items = this._getItems();
    if (items[itemId]) {
      items[itemId].props.lastOpened = timestamp;
      this._saveItems(items);
    } else {
      console.warn(`Item with ID ${itemId} does not exist.`);
    }
  }
  
  // Set the `isOpened` state of an item
  setNoteScope(itemId, noteScopeItemId, libraryId) {
    const items = this._getItems();
    if (items[itemId]?.props.libraryId === libraryId) {
      items[itemId].props.noteScopeItemId = noteScopeItemId;

      this._saveItems(items);
      this._trigger(itemId, isOpened, items[itemId]); // Trigger callbacks for the specific itemId

    } else {
      console.warn(`Item with ID ${itemId} does not exist.`);
      this.setItemAndParentsOpened(libraryId, itemId);

      if (items[itemId]) {
        items[itemId].props.noteScopeItemId = noteScopeItemId;
        this._saveItems(items);
      } else {
        console.warn(`Item with ID ${itemId} does not exist.`);
      }
    }
  }

  // Fetch the latest opened n items
  fetchLatestOpenedItems(n) {
    const items = this._getItems();

    // Filter items that have a lastOpened timestamp
    const itemsWithLastOpened = Object.entries(items).filter(
      ([_, item]) => item.props.lastOpened
    );

    // Sort items by lastOpened timestamp in descending order
    const sortedItems = itemsWithLastOpened.toSorted(
      (a, b) => b[1].props.lastOpened - a[1].props.lastOpened
    );

    // Return the top n items
    return sortedItems.slice(0, n).map(([itemId, item]) => ({
      itemId,
      ...item,
    }));
  }

  // Get the local state of an item
  getItemLocalState(itemId) {
    const items = this._getItems();
    return items[itemId] || null;
  }

  // Delete the local state of an item
  deleteItemLocalState(itemId) {
    const items = this._getItems();
    if (items[itemId]) {
      delete items[itemId];
      this._saveItems(items);

      // Clean up callbacks for the deleted itemId
      if (this.callbacks.has(itemId)) {
        this.callbacks.delete(itemId);
      }
    }
  }

  // Check if an item has local state
  hasItemLocalState(itemId) {
    const items = this._getItems();
    return !!items[itemId];
  }

  // Create or update the local state of an item
  createItemLocalState(itemId, props) {
    const items = this._getItems();
    console.log("creating localItem State with: ", props);
    items[itemId] = {
      type: props.type || 'default',
      props: {
        libraryId: props.libraryId || null,
        EditorTemplate: props.EditorTemplate || null,
        EditorType: props.EditorType || null,
        isOpened: props.isOpened || false,
        lastOpened: props.lastOpened || Date.now(), // Initialize lastOpened
        noteScopeItemId: props.noteScopeItemId || null,
      },
    };
    this._saveItems(items);
  }

  setItemAndParentsOpened(libraryId, itemId) {
    const libraryYTree = new YTree(dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory"));
    let parentKey = itemId;
    while (parentKey != "root" && parentKey !== null && parentKey !== undefined) {
      if (!itemLocalStateManager.hasItemLocalState(parentKey)) {
        itemLocalStateManager.createItemLocalState(parentKey, {
          type: libraryYTree.getNodeValueFromKey(parentKey).get("type"),
          props: { libraryId: libraryId, noteScopeItemId: libraryYTree.getNodeParentFromKey(parentKey) },
        });
      }
      this.setItemOpened(parentKey, true, libraryId);
      parentKey = libraryYTree.getNodeParentFromKey(parentKey);
    }
  }

}

const itemLocalStateManager = Object.freeze(new ItemLocalStateManager());

export default itemLocalStateManager;