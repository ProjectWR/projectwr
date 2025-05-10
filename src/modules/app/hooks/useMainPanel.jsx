import { useCallback } from "react";
import { mainPanelStore } from "../stores/mainPanelStore";
import useStoreHistory from "./useStoreHistory";

const useMainPanel = () => {
  const mainPanelState = mainPanelStore((state) => state.mainPanelState);
  const setMainPanelState = mainPanelStore((state) => state.setMainPanelState);

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

      // if (arr.find())

      setMainPanelState(newState);

      console.log("MAIN PANEL STATE BEING SAVED: ", mainPanelState);
    },
    [setMainPanelState, clearFuture, saveStateInHistory, mainPanelState]
  );

  return { mainPanelState, activatePanel };
};

export default useMainPanel;
