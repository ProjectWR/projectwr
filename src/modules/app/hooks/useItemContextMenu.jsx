import { useCallback, useMemo, useState } from "react";
import { useDeviceType } from "../ConfigProviders/DeviceTypeProvider";
import useMainPanel from "./useMainPanel";
import { exportItem } from "../lib/importExport";
import persistenceManagerForSubdocs from "../lib/persistenceSubDocs";
import { oauthStore } from "../stores/oauthStore";
import dataManagerSubdocs from "../lib/dataSubDoc";
import { appStore } from "../stores/appStore";

const useItemContextMenu = ({
  itemId,
  itemType,
  libraryId,
  ytree,
  itemTitle,
  formId, // ID of the form containing the title input
}) => {
  const { deviceType } = useDeviceType();
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = appStore((state) => state.setItemId);
  const setFocusedItemId = appStore((state) => state.setFocusedItemId);
  const setItemMode = appStore((state) => state.setItemMode);
  const { activatePanel } = useMainPanel();

  const deleteConfirmDontAskAgain = appStore(
    (state) => state.deleteConfirmDontAskAgain,
  );

  const driveSyncLoading = appStore((state) => state.driveSyncLoading);
  const userProfile = oauthStore((state) => state.userProfile);

  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    open: false,
    itemId: null,
    itemType: null,
    itemTitle: null,
  });

  const [deleteFromDrive, setDeleteFromDrive] = useState(false);

  const onCreateSectionClick = useCallback(() => {
    const newId = dataManagerSubdocs.createEmptySection(ytree, itemId);
    setFocusedItemId(newId);
    activatePanel("libraries", "details", [libraryId, newId]);
  }, [ytree, itemId, libraryId, setFocusedItemId, activatePanel]);

  const onCreatePaperClick = useCallback(() => {
    const newId = dataManagerSubdocs.createEmptyPaper(ytree, itemId);
    setFocusedItemId(newId);
    activatePanel("libraries", "details", [libraryId, newId]);
  }, [ytree, itemId, libraryId, setFocusedItemId, activatePanel]);

  const onCreateNoteClick = useCallback(() => {
    const newId = dataManagerSubdocs.createEmptyNote(ytree, itemId);
    setFocusedItemId(newId);
    activatePanel("libraries", "details", [libraryId, newId]);
  }, [ytree, itemId, libraryId, setFocusedItemId, activatePanel]);

  const onRenameClick = useCallback(() => {
    // Focus the title input in the details panel
    if (formId) {
      const form = document.getElementById(formId);
      if (form) {
        const titleInput = form.querySelector('input[name="item_title"]');
        if (titleInput) {
          titleInput.focus();
          titleInput.select();
        }
      }
    }
  }, [formId]);

  const onDeleteClick = useCallback(() => {
    if (deleteConfirmDontAskAgain && itemType !== "library") {
      // Skip confirmation dialog and delete directly (except libraries)
      dataManagerSubdocs.deleteItem(ytree, itemId);
      // Close panel -> Navigate to parent or root?
      // Logic handled by main panel or useMainPanel hook usually triggers state update
      // But we might want to close the panel explicitly
      setPanelOpened(true); // Open side panel
      setLibraryId(libraryId); // Keep library open
    } else {
      // Show confirmation dialog
      setDeleteConfirmDialog({
        open: true,
        itemId: itemId,
        itemType: itemType,
        itemTitle: itemTitle,
      });
    }
  }, [
    deleteConfirmDontAskAgain,
    itemType,
    ytree,
    itemId,
    itemTitle,
    setPanelOpened,
  ]);

  const options = useMemo(() => {
    if (itemType === "library") {
      return [
        {
          label: "Edit", // Already editing in details panel, maybe redundant?
          icon: (
            <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            onRenameClick();
          },
        },
        {
          label: "Save as archive",
          icon: (
            <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: async () => {
            await persistenceManagerForSubdocs.saveArchive(
              dataManagerSubdocs.getLibrary(libraryId),
            );
          },
        },
        {
          label: "Load from archive",
          icon: (
            <span className="icon-[ph--upload-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: async () => {
            await persistenceManagerForSubdocs.loadArchive(
              dataManagerSubdocs.getLibrary(libraryId),
            );
          },
        },
        {
          isDivider: true,
        },
        {
          label: "Rename",
          icon: (
            <span className="icon-[fluent--rename-a-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: onRenameClick,
        },
        {
          label: "Delete",
          icon: (
            <span className="icon-[mdi--delete-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: onDeleteClick,
        },
      ];
    } else if (itemType === "section" || itemType === "book") {
      return [
        {
          label: "Edit",
          icon: (
            <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            onRenameClick();
          },
        },
        {
          label: "Create section",
          icon: (
            <span className="icon-[fluent--folder-add-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: onCreateSectionClick,
        },
        {
          label: "Create paper",
          icon: (
            <span className="icon-[fluent--document-one-page-add-24-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: onCreatePaperClick,
        },
        {
          label: "Create Note",
          icon: (
            <span className="icon-[fluent--document-one-page-add-24-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: onCreateNoteClick,
        },
        {
          label: `Export ${itemType}`,
          icon: (
            <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            exportItem(ytree, itemId);
          },
        },
        {
          isDivider: true,
        },
        {
          label: "Rename",
          icon: (
            <span className="icon-[fluent--rename-a-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: onRenameClick,
        },
        {
          label: "Delete",
          icon: (
            <span className="icon-[mdi--delete-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: onDeleteClick,
        },
      ];
    } else if (itemType === "paper" || itemType === "note") {
      return [
        {
          label: "Edit",
          icon: (
            <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            onRenameClick();
          },
        },
        {
          label: `Export ${itemType}`,
          icon: (
            <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            exportItem(ytree, itemId);
          },
        },
        {
          isDivider: true,
        },
        {
          label: "Rename",
          icon: (
            <span className="icon-[fluent--rename-a-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: onRenameClick,
        },
        {
          label: "Delete",
          icon: (
            <span className="icon-[mdi--delete-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: onDeleteClick,
        },
      ];
    }
    return [];
  }, [
    itemType,
    libraryId,
    onRenameClick,
    onDeleteClick,
    onCreateSectionClick,
    onCreatePaperClick,
    onCreateNoteClick,
    ytree,
    itemId,
  ]);

  return {
    options,
    deleteConfirmDialog,
    setDeleteConfirmDialog,
    deleteFromDrive,
    setDeleteFromDrive,
    userProfile,
    driveSyncLoading,
  };
};

export default useItemContextMenu;
