import { Store } from "@tauri-apps/plugin-store";
import { useSyncExternalStore } from "react";

/**
 * Custom hook to sync a Tauri store with React state.
 * @param {Store} store - The Tauri store instance.
 * @returns {any} - The current state of the store.
 */
const useLocalStore = (store) => {
  return useSyncExternalStore(
    // Subscribe function
    (callback) => {
      const unlistenPromise = store.onChange(callback);

      // Return an unsubscribe function
      return () => {
        unlistenPromise.then((unlisten) => unlisten());
      };
    },
    // Get snapshot function
    () => {
      // Return the current state of the store
      // You can customize this based on how you want to represent the store's state
      return store.keys(); // Example: returns all key pairs in the store
    }
  );
};

export default useLocalStore;