import { useEffect, useState } from "react";
import { mainPanelStore } from "../stores/mainPanelStore";

const past = [];
const future = [];

/**
 * @typedef {Object} TimeSlice
 * @property {string} activity
 * @property {string} libraryId
 * @property {string} itemId
 * @property {string} itemMode
 * @property {string} templateId
 * @property {string} templateMode
 * @property {boolean} [past]
 */

const useStoreHistory = () => {
  const mainPanelState = mainPanelStore((state) => state.mainPanelState);

  const setMainPanelState = mainPanelStore((state) => state.setMainPanelState);

  const saveStateInHistory = () => {
    past.push({
      mainPanelState,
    });

    if (past.length > 0) setCanGoBack(true);
    else setCanGoBack(false);
    if (future.length > 0) setCanGoForward(true);
    else setCanGoForward(false);
  };

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    if (past.length > 0) setCanGoBack(true);
    else setCanGoBack(false);
    if (future.length > 0) setCanGoForward(true);
    else setCanGoForward(false);
  }, [mainPanelState]);

  const goBack = () => {
    if (!canGoBack) return;

    saveStateInHistory();
    future.push(past.pop());

    const state = past.pop();

    setMainPanelState(state.mainPanelState);
  };

  const goForward = () => {
    if (!canGoForward) return;

    future.push({
      mainPanelState,
    });

    past.push(future.pop());

    const state = future.pop();
    setMainPanelState(state.mainPanelState);
  };

  const clearFuture = () => {
    future.length = 0;
    setCanGoForward(false);
  };

  return {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  };
};

export default useStoreHistory;
