let instance;

class ItemLocalStateManager {
  constructor() {
    if (instance) {
      throw new Error("ItemLocalStateManager is a singleton class. Use getInstance() instead.");
    }

    this.storageKey = 'items'; // Key for localStorage
    this.callbacks = new Map(); // Use a Map to store callbacks for specific itemIds
    instance = this;
  }

  // Register a callback for a specific itemId's isOpened state
  on(itemId, callback) {
    if (!this.callbacks.has(itemId)) {
      this.callbacks.set(itemId, new Set()); // Initialize a Set for the itemId if it doesn't exist
    }
    this.callbacks.get(itemId).add(callback); // Add the callback to the Set
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

  // Trigger all callbacks for a specific itemId
  _trigger(itemId, ...args) {
    if (this.callbacks.has(itemId)) {
      this.callbacks.get(itemId).forEach((callback) => callback(...args));
    }
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
  setItemOpened(itemId, isOpened) {
    const items = this._getItems();
    if (items[itemId]) {
      const previousState = items[itemId].props.isOpened;
      if (previousState !== isOpened) { // Only trigger if the state changes
        items[itemId].props.isOpened = isOpened;

        // Update lastOpened timestamp if the item is being opened
        if (isOpened) {
          items[itemId].props.lastOpened = Date.now();
        }

        this._saveItems(items);
        this._trigger(itemId, isOpened, items[itemId]); // Trigger callbacks for the specific itemId
      }
    } else {
      console.warn(`Item with ID ${itemId} does not exist.`);
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
    items[itemId] = {
      type: props.type || 'default',
      props: {
        EditorTemplate: props.EditorTemplate || null,
        EditorType: props.EditorType || null,
        isOpened: props.isOpened || false,
        lastOpened: props.lastOpened || null, // Initialize lastOpened
      },
    };
    this._saveItems(items);
  }
}

const itemLocalStateManager = Object.freeze(new ItemLocalStateManager());

export default itemLocalStateManager;