import { useCallback, useEffect } from "react";
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

    },
    [setMainPanelState, clearFuture, saveStateInHistory, mainPanelState]
  );

  useEffect(() => {
    const newState = JSON.parse(JSON.stringify(mainPanelState));

    if (
      !tabs?.find((value) => {
        return equalityDeep(value, newState);
      })
    ) {
      const newTabs = JSON.parse(JSON.stringify(tabs));

      newTabs.push(newState);
      if (newTabs.length > 10) {
        newTabs.shift();
      }

      setTabs(newTabs);
    }
  }, [mainPanelState, setTabs]);

  return { mainPanelState, activatePanel };
};

export default useMainPanel;
