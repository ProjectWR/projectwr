import { useMemo, useSyncExternalStore } from "react";

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
 * @param {Y.Map | null} yMap
 */
export default function useSharedYMap(yMap) {
  // Create a stable dummy store for null yMap to avoid conditional hook calls
  // IMPORTANT: getSnapshot must return a stable reference to prevent infinite re-renders
  const dummyStore = useMemo(() => {
    const emptyState = {};
    return {
      subscribe: () => () => {},
      getSnapshot: () => emptyState,
    };
  }, []);

  const store = yMap ? getOrCreateStore(yMap) : dummyStore;
  // useSyncExternalStore handles subscribe/getSnapshot
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}
