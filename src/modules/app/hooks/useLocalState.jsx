import { useState, useEffect } from "react";
import localStateManager from "../lib/localState";

/**
 * Hook to use local state for a specific item.
 * @param {string} libraryId
 * @param {string} itemId
 * @returns {{lastOpenedDtm: string | null, editorStyle: string}}
 */
export function useKeyLocalState(libraryId, itemId) {
  const [state, setState] = useState({
    lastOpenedDtm: null,
    editorStyle: "unselected",
  });

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      const val = await localStateManager.get(libraryId, itemId);
      if (isMounted) setState(val);
    };

    loadInitial();

    const callback = (val) => {
      if (isMounted) {
        setState(val || { lastOpenedDtm: null, editorStyle: "unselected" });
      }
    };

    localStateManager.observeKey(libraryId, itemId, callback);

    return () => {
      isMounted = false;
      localStateManager.unobserveKey(libraryId, itemId, callback);
    };
  }, [libraryId, itemId]);

  return state;
}

/**
 * Hook to use all local states.
 * @returns {Object}
 */
export function useAllLocalState() {
  const [allState, setAllState] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      const all = await localStateManager.getAll();
      if (isMounted) setAllState(all);
    };

    loadInitial();

    const callback = (key, value) => {
      if (isMounted) {
        setAllState((prev) => {
          if (value === null) {
            const newState = { ...prev };
            delete newState[key];
            return newState;
          }
          return { ...prev, [key]: value };
        });
      }
    };

    localStateManager.observeAll(callback);

    return () => {
      isMounted = false;
      localStateManager.unobserveAll(callback);
    };
  }, []);

  return allState;
}
