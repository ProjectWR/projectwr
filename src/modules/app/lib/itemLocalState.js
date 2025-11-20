import { produce } from 'immer';
import { YTree } from "yjs-orderedtree";
import dataManagerSubdocs from "./dataSubDoc";

let instance;

class ItemLocalStateManager {
  constructor() {
    if (instance) {
      throw new Error("ItemLocalStateManager is a singleton class. Use getInstance() instead.");
    }

    this.storageKey = 'items';
    this.callbacks = new Map();
    this.callbacksForAll = new Set();
    instance = this;
  }

  _getKey(libraryId, itemId) {
    return `${libraryId}::${itemId}`;
  }

  on(libraryId, itemId, callback) {
    const key = this._getKey(libraryId, itemId);
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, new Set());
    }
    this.callbacks.get(key).add(callback);
  }

  onAll(callback) {
    this.callbacksForAll.add(callback);
  }

  off(libraryId, itemId, callback) {
    const key = this._getKey(libraryId, itemId);
    if (this.callbacks.has(key)) {
      const callbacksForItem = this.callbacks.get(key);
      callbacksForItem.delete(callback);
      if (callbacksForItem.size === 0) {
        this.callbacks.delete(key);
      }
    }
  }

  offAll(callback) {
    this.callbacksForAll.delete(callback);
  }

  _trigger(libraryId, itemId, ...args) {
    const key = this._getKey(libraryId, itemId);
    if (this.callbacks.has(key)) {
      this.callbacks.get(key).forEach(callback => callback(...args));
    }
    this.callbacksForAll.forEach(callback => callback(...args));
  }

  _getItems() {
    const itemsJSON = localStorage.getItem(this.storageKey);
    return itemsJSON ? JSON.parse(itemsJSON) : {};
  }

  _saveItems(items) {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  _updateItems(producer) {
    const prevItems = this._getItems();
    const nextItems = produce(prevItems, producer);
    if (prevItems !== nextItems) {
      this._saveItems(nextItems);
    }
    return nextItems;
  }

  getPaperEditorTemplate(libraryId, itemId) {
    const key = this._getKey(libraryId, itemId);
    const items = this._getItems();
    return items[key]?.props?.EditorTemplate || null;
  }

  setPaperEditorTemplate(libraryId, itemId, templateId) {
    const key = this._getKey(libraryId, itemId);
    const nextItems = this._updateItems(draft => {
      if (draft[key]) {
        draft[key].props.EditorTemplate = templateId;
      }
    });

    if (nextItems[key]?.props?.EditorTemplate === templateId) {
      this._trigger(libraryId, itemId, templateId, nextItems[key]);
    } else {
      console.warn(`Item with ID ${itemId} does not exist.`);
      this.setItemAndParentsOpened(libraryId, itemId);
    }
  }

  getPaperEditorType(libraryId, itemId) {
    const key = this._getKey(libraryId, itemId);
    const items = this._getItems();
    return items[key]?.props?.EditorType || null;
  }

  isItemOpened(libraryId, itemId) {
    const key = this._getKey(libraryId, itemId);
    const items = this._getItems();
    return items[key]?.props?.isOpened || false;
  }

  setItemOpened(libraryId, itemId, isOpened) {
    const key = this._getKey(libraryId, itemId);
    const nextItems = this._updateItems(draft => {
      const item = draft[key];
      if (item?.props?.libraryId === libraryId) {
        item.props.isOpened = isOpened;
        if (isOpened) {
          item.props.lastOpened = Date.now();
        }
      }
    });

    const item = nextItems[key];
    if (item?.props?.libraryId === libraryId) {
      this._trigger(libraryId, itemId, isOpened, item);
    } else {
      console.warn(`Item with ID ${itemId} does not exist.`);
      this.setItemAndParentsOpened(libraryId, itemId);
    }
  }

  getLastOpened(libraryId, itemId) {
    const key = this._getKey(libraryId, itemId);
    const items = this._getItems();
    return items[key]?.props?.lastOpened || null;
  }

  setLastOpened(libraryId, itemId, timestamp) {
    const key = this._getKey(libraryId, itemId);
    this._updateItems(draft => {
      if (draft[key]) {
        draft[key].props.lastOpened = timestamp;
      }
    });
  }

  setNoteScope(libraryId, itemId, noteScopeItemId) {
    const key = this._getKey(libraryId, itemId);
    let wasUpdated = false;

    const nextItems = this._updateItems(draft => {
      const item = draft[key];
      if (item?.props?.libraryId === libraryId) {
        item.props.noteScopeItemId = noteScopeItemId;
        wasUpdated = true;
      }
    });

    if (wasUpdated) {
      this._trigger(libraryId, itemId, nextItems[key].props.noteScopeItemId, nextItems[key]);
    } else {
      console.warn(`Item with ID ${itemId} does not exist.`);
      this.setItemAndParentsOpened(libraryId, itemId);

      this._updateItems(draft => {
        if (draft[key]) {
          draft[key].props.noteScopeItemId = noteScopeItemId;
        }
      });
    }
  }

  fetchLatestOpenedItems(n) {
    const items = this._getItems();
    const itemsWithLastOpened = Object.entries(items).filter(
      ([_, item]) => item.props.lastOpened
    );
    const sortedItems = itemsWithLastOpened.toSorted(
      (a, b) => b[1].props.lastOpened - a[1].props.lastOpened
    );
    return sortedItems.slice(0, n).map(([itemId, item]) => ({
      itemIdLibraryId: itemId,
      ...item,
    }));
  }

  getItemLocalState(libraryId, itemId) {
    const key = this._getKey(libraryId, itemId);
    const items = this._getItems();
    return items[key] || null;
  }

  deleteItemLocalState(libraryId, itemId) {
    const key = this._getKey(libraryId, itemId);
    const prevItems = this._getItems();
    const nextItems = this._updateItems(draft => {
      delete draft[key];
    });

    if (prevItems[key] && !nextItems[key]) {
      if (this.callbacks.has(key)) {
        this.callbacks.delete(key);
      }
    }
  }

  hasItemLocalState(libraryId, itemId) {
    const key = this._getKey(libraryId, itemId);
    const items = this._getItems();
    return !!items[key];
  }

  createItemLocalState(libraryId, itemId, props) {
    const key = this._getKey(libraryId, itemId);
    this._updateItems(draft => {
      draft[key] = {
        type: props.type || 'default',
        props: {
          libraryId: libraryId,
          EditorTemplate: props.EditorTemplate || null,
          EditorType: props.EditorType || null,
          isOpened: props.isOpened || false,
          lastOpened: props.lastOpened || Date.now(),
          noteScopeItemId: props.noteScopeItemId || null,
        },
      };
    });
  }

  setItemAndParentsOpened(libraryId, itemId) {
    const libraryYTree = new YTree(dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory"));
    let parentKey = itemId;

    while (parentKey && parentKey !== "root") {
      if (!this.hasItemLocalState(libraryId, parentKey)) {
        const node = libraryYTree.getNodeValueFromKey(parentKey);
        this.createItemLocalState(libraryId, parentKey, {
          type: node?.get("type"),
          props: {
            noteScopeItemId: libraryYTree.getNodeParentFromKey(parentKey)
          }
        });
      }
      this.setItemOpened(libraryId, parentKey, true);
      parentKey = libraryYTree.getNodeParentFromKey(parentKey);
    }
  }
}

const itemLocalStateManager = Object.freeze(new ItemLocalStateManager());
export default itemLocalStateManager;