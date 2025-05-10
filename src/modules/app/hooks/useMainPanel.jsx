import { useCallback } from "react";
import { mainPanelStore } from "../stores/mainPanelStore";
import useStoreHistory from "./useStoreHistory";
import { equalityDeep } from "lib0/function";

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

  /**
   * @type {Array<MainPanelState>}
   */
  const tabs = mainPanelStore((state) => state.tabs);

  const arr = [];

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

      if (
        !tabs?.find((value) => {
          return equalityDeep(value, newState);
        })
      ) {
        tabs.push(newState);
        if (tabs.size() > 10) {
          tabs.shift();
        }
      }

      setMainPanelState(newState);

      console.log("MAIN PANEL STATE BEING SAVED: ", mainPanelState);
    },
    [setMainPanelState, clearFuture, saveStateInHistory, mainPanelState]
  );

  return { mainPanelState, activatePanel };
};

export default useMainPanel;
