import { useCallback } from "react";
import { mainPanelStore } from "../stores/mainPanelStore";
import useStoreHistory from "./useStoreHistory";

import { appStore } from "../stores/appStore";
import { getOrInitLibraryYTree } from "../lib/ytree";

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

  // App Store Setters
  const setFocusedItem = appStore((state) => state.setFocusedItem);
  const setTemplateId = appStore((state) => state.setTemplateId);
  const setNotesPanelState = appStore((state) => state.setNotesPanelState);
  const setItemId = appStore((state) => state.setItemId);
  const setItemMode = appStore((state) => state.setItemMode);

  const { saveStateInHistory, clearFuture } = useStoreHistory();

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

      // Consolidate side effects here to prevent multiple render cycles
      if (panelType === "libraries") {
        const isAtRoot = breadcrumbs.length === 1;
        const rootId = breadcrumbs[0];
        const youngestId = breadcrumbs[breadcrumbs.length - 1];

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

        if (breadcrumbs[0] === breadcrumbs[1]) {
          return;
        }

        const itemType = ytree.getNodeValueFromKey(breadcrumbs[1])?.get("type");

        if (itemType !== "book" && itemType !== "section") {
          return;
        }
      } else if (panelType === "templates") {
        const rootId = breadcrumbs[0];
        setTemplateId(rootId);
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
    ]
  );

  return { mainPanelState, activatePanel };
};

export default useMainPanel;
