import { useCallback, useEffect, useRef } from "react";
import { mainPanelStore } from "../stores/mainPanelStore";
import useStoreHistory from "./useStoreHistory";
import { equalityDeep } from "lib0/function";
import { appStore } from "../stores/appStore";

const useMainPanel = () => {
  /**
   * @type {MainPanelState}
   * @typedef {Object} MainPanelState
   * @property {string} panelType - The current panel type (e.g., "home").
   * @property {*} mode - The current mode of the panel (can be null or specific mode).
   * @property {Array} breadcrumbs - An array of breadcrumb strings representing the navigation path.
   */
  const mainPanelState = mainPanelStore((state) => state.mainPanelState);
  const setMainPanelState = mainPanelStore((state) => state.setMainPanelState);

  const setNotesPanelState = appStore((state) => state.setNotesPanelState);

  /**
   * @type {Array<MainPanelState>}
   */
  const tabs = mainPanelStore((state) => state.tabs);

  const setTabs = mainPanelStore((state) => state.setTabs);

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const activatePanel = useCallback(
    async (panelType, mode, breadcrumbs) => {
      saveStateInHistory();
      clearFuture();

      const newState = {
        panelType: panelType,
        mode: mode,
        breadcrumbs: breadcrumbs,
      };

      setMainPanelState(newState);

      if (panelType === "libraries") {
        setNotesPanelState({
          libraryId: breadcrumbs[0],
          itemId: breadcrumbs[1],
        });
      }
    },
    [setMainPanelState, clearFuture, saveStateInHistory]
  );

  return { mainPanelState, activatePanel };
};

export default useMainPanel;
