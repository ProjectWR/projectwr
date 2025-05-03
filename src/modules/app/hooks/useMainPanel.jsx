import { useCallback } from "react";
import { mainPanelStore } from "../stores/mainPanelStore";
import useStoreHistory from "./useStoreHistory";

const useMainPanel = () => {
  const mainPanelState = mainPanelStore((state) => state.mainPanelState);
  const setMainPanelState = mainPanelStore((state) => state.setMainPanelState);

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const activatePanel = useCallback(
    (panelType, mode, breadcrumbs) => {
      setMainPanelState({
        panelType: panelType,
        mode: mode,
        breadcrumbs: breadcrumbs,
      });

      saveStateInHistory();
      clearFuture();
    },
    [setMainPanelState, clearFuture, saveStateInHistory]
  );

  return { mainPanelState, activatePanel };
};

export default useMainPanel;
