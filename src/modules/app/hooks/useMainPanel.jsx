import { useCallback } from "react";
import { mainPanelStore } from "../stores/mainPanelStore";
import useStoreHistory from "./useStoreHistory";
import { appStore } from "../stores/appStore";
import { getOrInitLibraryYTree } from "../lib/ytree";
import localStateManager from "../lib/localState";
import dataManagerSubdocs from "../lib/dataSubDoc";
import templateManager from "../lib/templates";
import appThemeManager from "../lib/appTheme";

export const isMainPanelStateValid = (state) => {
  const { panelType, mode, breadcrumbs } = state;

  try {
    if (panelType === "libraries") {
      if (dataManagerSubdocs.getLibrary(breadcrumbs[0])) {
        if (breadcrumbs.length > 1 && breadcrumbs[breadcrumbs.length - 1] != breadcrumbs[0]) {
          const ytree = getOrInitLibraryYTree(breadcrumbs[0]);
          if (ytree.getNodeValueFromKey(breadcrumbs[1])) {
            return true;
          }
        }

        if (breadcrumbs.length === 2 && breadcrumbs[0] == breadcrumbs[1]) {
          return true;
        }

        return true;
      }
    }

    if (panelType === "templates") {
      if (templateManager.getTemplate(breadcrumbs[0])) {
        return true;
      }
    }

    if (panelType === "appThemes") {
      const appThemes = appThemeManager.getTheme(breadcrumbs[0]);
      if (appThemes[breadcrumbs[0]]) {
        return true;
      }
    }

    if (panelType === "home") {
      return true;
    }

    if (panelType === "settings") {
      return true;
    }

    if (panelType === "dictionary") {
      return true
    }

    if (panelType === "compileManuscript") {
      return true;
    }

  } catch {
    return false;
  }

  return false;

}

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
  const setSplitMode = mainPanelStore((state) => state.setSplitMode);
  const setSplitPanelState = mainPanelStore(
    (state) => state.setSplitPanelState,
  );
  const splitRatio = mainPanelStore((state) => state.splitRatio);
  const setSplitRatio = mainPanelStore((state) => state.setSplitRatio);

  // App Store Setters
  const setFocusedItem = appStore((state) => state.setFocusedItem);
  const setTemplateId = appStore((state) => state.setTemplateId);
  const setNotesPanelState = appStore((state) => state.setNotesPanelState);
  const setItemId = appStore((state) => state.setItemId);
  const setItemMode = appStore((state) => state.setItemMode);

  const { saveStateInHistory, clearFuture } = useStoreHistory();

  const activatePanel = useCallback(
    async (panelType, mode, breadcrumbs) => {
      if (!isMainPanelStateValid({ panelType, mode, breadcrumbs })) {
        console.warn("Attempted to activate invalid panel state:", { panelType, mode, breadcrumbs });
        return;
      }

      saveStateInHistory();
      clearFuture();

      const newState = {
        panelType: panelType,
        mode: mode,
        breadcrumbs: breadcrumbs,
      };

      setMainPanelState(newState);

      // Consolidate side effects here to prevent multiple render cycles
      if (panelType === "libraries") {
        const isAtRoot = breadcrumbs.length === 1;
        const rootId = breadcrumbs[0];
        const youngestId = breadcrumbs[breadcrumbs.length - 1];

        localStateManager.updateLastOpened(rootId, youngestId);

        setFocusedItem({
          type: "libraries",
          libraryId: rootId,
          itemId: isAtRoot ? null : youngestId,
        });

        if (isAtRoot) {
          setItemId("unselected");
        } else {
          setItemId(youngestId);
        }

        if (mode) {
          setItemMode(mode);
        }

        // Update Notes Panel Scope if library changed
        // We can't easily check previous state here without ref, but updating it
        // to the current library root is generally safe/idempotent if handled by store
        setNotesPanelState({ libraryId: rootId, itemId: "root" });

        console.log("activatePanel", panelType, mode, breadcrumbs);

        const ytree = getOrInitLibraryYTree(breadcrumbs[0]);

        if (isAtRoot || breadcrumbs[0] === breadcrumbs[1]) {
          return;
        }

        const itemType = ytree.getNodeValueFromKey(breadcrumbs[1])?.get("type");

        if (itemType !== "book" && itemType !== "section") {
          return;
        }
      } else if (panelType === "templates") {
        const rootId = breadcrumbs[0];
        setTemplateId(rootId);
      } else if (panelType === "appThemes") {
        const rootId = breadcrumbs[0];
        const setAppThemeId = appStore.getState().setAppThemeId;
        setAppThemeId(rootId);
      }
    },
    [
      setMainPanelState,
      clearFuture,
      saveStateInHistory,
      setFocusedItem,
      setTemplateId,
      setNotesPanelState,
      setItemId,
      setItemMode,
    ],
  );

  const activateSplitPanel = useCallback(
    async (panelType, mode, breadcrumbs, orientation) => {
      setSplitMode(orientation);

      if (splitRatio === null) {
        setSplitRatio(0.5);
      }

      const newState = {
        panelType: panelType,
        mode: mode,
        breadcrumbs: breadcrumbs,
      };

      setSplitPanelState(newState);
    },
    [setSplitMode, setSplitPanelState, setSplitRatio, splitRatio],
  );

  const deactivateSplitPanel = useCallback(async () => {
    setSplitMode("none");
    setSplitRatio(null);
    setSplitPanelState(null);
  }, [setSplitMode, setSplitPanelState, setSplitRatio]);

  return {
    mainPanelState,
    activatePanel,
    activateSplitPanel,
    deactivateSplitPanel,
  };
};

export default useMainPanel;
