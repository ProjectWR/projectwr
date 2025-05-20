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

  on(itemId, callback) {
    if (!this.callbacks.has(itemId)) {
      this.callbacks.set(itemId, new Set());
    }
    this.callbacks.get(itemId).add(callback);
  }

  onAll(callback) {
    this.callbacksForAll.add(callback);
  }

  off(itemId, callback) {
    if (this.callbacks.has(itemId)) {
      const callbacksForItem = this.callbacks.get(itemId);
      callbacksForItem.delete(callback);
      if (callbacksForItem.size === 0) {
        this.callbacks.delete(itemId);
      }
    }
  }

  offAll(callback) {
    this.callbacksForAll.delete(callback);
  }

  _trigger(itemId, ...args) {
    if (this.callbacks.has(itemId)) {
      this.callbacks.get(itemId).forEach(callback => callback(...args));
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

  getPaperEditorTemplate(itemId) {
    const items = this._getItems();
    return items[itemId]?.props?.EditorTemplate || null;
  }

  setPaperEditorTemplate(itemId, templateId, libraryId) {
    const nextItems = this._updateItems(draft => {
      if (draft[itemId]) {
        draft[itemId].props.EditorTemplate = templateId;
      }
    });

    if (nextItems[itemId]?.props?.EditorTemplate === templateId) {
      this._trigger(itemId, templateId, nextItems[itemId]);
    } else {
      console.warn(`Item with ID ${itemId} does not exist.`);
      this.setItemAndParentsOpened(libraryId, itemId);
    }
  }

  getPaperEditorType(itemId) {
    const items = this._getItems();
    return items[itemId]?.props?.EditorType || null;
  }

  isItemOpened(itemId) {
    const items = this._getItems();
    return items[itemId]?.props?.isOpened || false;
  }

  setItemOpened(itemId, isOpened, libraryId) {
    const nextItems = this._updateItems(draft => {
      const item = draft[itemId];
      if (item?.props?.libraryId === libraryId) {
        item.props.isOpened = isOpened;
        if (isOpened) {
          item.props.lastOpened = Date.now();
        }
      }
    });

    const item = nextItems[itemId];
    if (item?.props?.libraryId === libraryId) {
      this._trigger(itemId, isOpened, item);
    } else {
      console.warn(`Item with ID ${itemId} does not exist.`);
      this.setItemAndParentsOpened(libraryId, itemId);
    }
  }

  getLastOpened(itemId) {
    const items = this._getItems();
    return items[itemId]?.props?.lastOpened || null;
  }

  setLastOpened(itemId, timestamp) {
    this._updateItems(draft => {
      if (draft[itemId]) {
        draft[itemId].props.lastOpened = timestamp;
      }
    });
  }

  setNoteScope(itemId, noteScopeItemId, libraryId) {
    let wasUpdated = false;

    const nextItems = this._updateItems(draft => {
      const item = draft[itemId];
      if (item?.props?.libraryId === libraryId) {
        item.props.noteScopeItemId = noteScopeItemId;
        wasUpdated = true;
      }
    });

    if (wasUpdated) {
      this._trigger(itemId, nextItems[itemId].props.noteScopeItemId, nextItems[itemId]);
    } else {
      console.warn(`Item with ID ${itemId} does not exist.`);
      this.setItemAndParentsOpened(libraryId, itemId);

      this._updateItems(draft => {
        if (draft[itemId]) {
          draft[itemId].props.noteScopeItemId = noteScopeItemId;
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
      itemId,
      ...item,
    }));
  }

  getItemLocalState(itemId) {
    const items = this._getItems();
    return items[itemId] || null;
  }

  deleteItemLocalState(itemId) {
    const prevItems = this._getItems();
    const nextItems = this._updateItems(draft => {
      delete draft[itemId];
    });

    if (prevItems[itemId] && !nextItems[itemId]) {
      if (this.callbacks.has(itemId)) {
        this.callbacks.delete(itemId);
      }
    }
  }

  hasItemLocalState(itemId) {
    const items = this._getItems();
    return !!items[itemId];
  }

  createItemLocalState(itemId, props) {
    this._updateItems(draft => {
      draft[itemId] = {
        type: props.type || 'default',
        props: {
          libraryId: props.libraryId || null,
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
      if (!this.hasItemLocalState(parentKey)) {
        const node = libraryYTree.getNodeValueFromKey(parentKey);
        this.createItemLocalState(parentKey, {
          type: node?.get("type"),
          props: {
            libraryId,
            noteScopeItemId: libraryYTree.getNodeParentFromKey(parentKey)
          }
        });
      }
      this.setItemOpened(parentKey, true, libraryId);
      parentKey = libraryYTree.getNodeParentFromKey(parentKey);
    }
  }
}

const itemLocalStateManager = Object.freeze(new ItemLocalStateManager());
export default itemLocalStateManager;