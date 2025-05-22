import { useEffect, useSyncExternalStore } from "react";

// Global registry: YMap instance -> { state, listeners, observer }
const yMapStoreRegistry = new WeakMap();

/**
 * @param {Y.Map} yMap
 * @returns {object}
 */
function getOrCreateStore(yMap) {
  let store = yMapStoreRegistry.get(yMap);
  if (!store) {
    let currentState = yMap.toJSON();
    const listeners = new Set();

    // Observer to update state and notify all listeners
    const observer = () => {
      currentState = yMap.toJSON();
      listeners.forEach((cb) => cb());
    };

    store = {
      getSnapshot: () => currentState,
      subscribe: (cb) => {
        listeners.add(cb);
        // If this is the first listener, add the YMap observer
        if (listeners.size === 1) {
          yMap.observe(observer);
        }
        return () => {
          listeners.delete(cb);
          // If last listener removed, cleanup the YMap observer
          if (listeners.size === 0) {
            yMap.unobserve(observer);
          }
        };
      },
      // For debugging/testing
      _listeners: listeners,
    };

    yMapStoreRegistry.set(yMap, store);
  }
  return store;
}

/**
 * Shared YMap hook: subscribes to YMap in a singleton way.
 * @param {Y.Map} yMap
 */
export default function useSharedYMap(yMap) {
  const store = getOrCreateStore(yMap);
  // useSyncExternalStore handles subscribe/getSnapshot
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}
