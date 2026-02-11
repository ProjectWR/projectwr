import { equalityDeep } from "lib0/function";
import useMainPanel from "../../hooks/useMainPanel";
import PropTypes from "prop-types";
import { mainPanelStore } from "../../stores/mainPanelStore";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { checkForYTree, YTree } from "yjs-orderedtree";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../stores/appStore";
import useStoreHistory from "../../hooks/useStoreHistory";
import { ActionButton } from "./ActionBar";
import { StyledTooltip } from "./StyledTooltip";
import DialogWrapper from "./DialogWrapper";
import persistenceManagerForSubdocs from "../../lib/persistenceSubDocs";
import driveOrchestrator from "../../lib/drive/driveOrchestrator";
import { oauthStore } from "../../stores/oauthStore";
import { exportItem } from "../../lib/importExport";
import ContextMenuWrapper from "./ContextMenuWrapper";

export const TabsBar = ({ isNotesPanelAwake, refreshNotesPanel }) => {
  /**
   * @type {MainPanelState}
   * @typedef {Object} MainPanelState
   * @property {string} panelType - The current panel type (e.g., "home").
   * @property {*} mode - The current mode of the panel (can be null or specific mode).
   * @property {Array} breadcrumbs - An array of breadcrumb strings representing the navigation path.
   */
  const mainPanelState = mainPanelStore((state) => state.mainPanelState);
  /**
   * @type {Array<MainPanelState>}
   */
  const tabs = mainPanelStore((state) => state.tabs);

  const setTabs = mainPanelStore((state) => state.setTabs);

  const { canGoBack, goBack, canGoForward, goForward } = useStoreHistory();

  const { activatePanel } = useMainPanel();

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
  }, [mainPanelState, setTabs, tabs]);

  return (
    <>
      <div
        data-tauri-drag-region
        className={`border-b flex w-fit z-100 border-appLayoutBorder bg-appBackgroundAccent h-full min-h-full text-appLayoutText  px-1
          `}
      >
        <ActionButton
          onClick={() => {
            activatePanel("dictionary", null, []);
          }}
        >
          <StyledTooltip label="Dictionary">
            <div className={`h-full pt-px w-actionBarButtonIconSize relative`}>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key="searchButton"
                className="icon-[material-symbols-light--match-word-rounded] w-full h-full top-0 left-0 absolute bg-appLayoutText"
              ></motion.span>
            </div>
          </StyledTooltip>
        </ActionButton>

        <ActionButton
          onClick={() => {
            activatePanel("home", null, []);
          }}
        >
          <StyledTooltip label="Home" position="bottom">
            <div className={`h-full w-actionBarButtonIconSize relative`}>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key="homeButton"
                className="icon-[material-symbols-light--home] w-full h-full top-0 left-0 absolute bg-appLayoutText"
              ></motion.span>
            </div>
          </StyledTooltip>
        </ActionButton>

        <ActionButton
          onClick={() => {
            if (canGoBack) {
              goBack();
            }
          }}
          disabled={!canGoBack}
        >
          <StyledTooltip label="Go Back" position="bottom">
            <div className="h-full w-actionBarButtonIconSize relative">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: canGoBack ? 1 : 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key="historyGoBack"
                className="icon-[material-symbols-light--arrow-back-rounded] w-full h-full top-0 left-0 absolute bg-appLayoutText"
              ></motion.span>
            </div>
          </StyledTooltip>
        </ActionButton>

        <ActionButton
          onClick={() => {
            if (canGoForward) {
              goForward();
            }
          }}
          disabled={!canGoForward}
        >
          <StyledTooltip label="Go Forward" position="bottom">
            <div className="h-full w-actionBarButtonIconSize relative">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: canGoForward ? 1 : 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key="historyGoForward"
                className="icon-[material-symbols-light--arrow-forward-rounded] w-full h-full top-0 left-0 absolute bg-appLayoutText"
              ></motion.span>
            </div>
          </StyledTooltip>
        </ActionButton>
      </div>

      <div
        data-tauri-drag-region
        id="TabsContent"
        className="grow basis-0 min-w-0 min-h-full h-full z-[4] flex justify-start gap-1 border-b border-appLayoutBorder bg-appBackgroundAccent"
      >
        <AnimatePresence>
          {tabs?.map((tab) => {
            const { panelType, mode, breadcrumbs } = tab;

            return (
              <motion.div
                data-tauri-drag-region
                key={
                  breadcrumbs.length >= 1
                    ? breadcrumbs[0] + "-" + breadcrumbs[breadcrumbs.length - 1]
                    : panelType
                }
                layout
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "var(--tabWidth)" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.1 }}
                className="h-full w-full min-w-0 overflow-x-hidden overflow-ellipsis flex items-center "
              >
                <TabButton
                  panelType={panelType}
                  mode={mode}
                  breadcrumbs={breadcrumbs}
                  isRemoveAvailable={tabs.length > 1}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div
        data-tauri-drag-region
        className={`border-b flex items-center w-fit min-w-0 z-1000 border-appLayoutBorder h-full min-h-full text-appLayoutText bg-appBackgroundAccent  px-1
          `}
      >
        <NotesPanelOpenButton
          isNotesPanelAwake={isNotesPanelAwake}
          refreshNotesPanel={refreshNotesPanel}
        />
      </div>
    </>
  );
};

export const TabButton = ({
  panelType,
  mode,
  splitTab = false,
  breadcrumbs,
  isRemoveAvailable = true,
  splitPanelTab = false,
}) => {
  const dndRef = useRef(null);

  const setActivity = appStore((state) => state.setActivity);
  const setLibraryId = appStore((state) => state.setLibraryId);

  const mainPanelState = mainPanelStore((state) => state.mainPanelState);
  const { activateSplitPanel, deactivateSplitPanel } = useMainPanel();

  const splitMode = mainPanelStore((state) => state.splitMode);

  /**
   * @type {Array<MainPanelState>}
   */
  const tabs = mainPanelStore((state) => state.tabs);

  const setTabs = mainPanelStore((state) => state.setTabs);

  const { activatePanel } = useMainPanel();

  const [label, setLabel] = useState("DEFAULT");
  const [icon, setIcon] = useState(
    <span className="icon-[icon-park-outline--dot] w-full h-full"></span>,
  );

  const action = useCallback(() => {
    if (panelType === "libraries") {
      setActivity("libraries");
      setLibraryId(breadcrumbs[0]);
    }

    activatePanel(panelType, mode, breadcrumbs);
  }, [panelType, mode, breadcrumbs, activatePanel, setActivity, setLibraryId]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ITEM",
    item: () => {
      if (panelType === "libraries") {
        return {
          appItemType: "libraries",
          id: breadcrumbs[breadcrumbs.length - 1],
          libraryId: breadcrumbs[0],
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "templates") {
        return {
          appItemType: "templates",
          id: breadcrumbs[0],
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "dictionary") {
        return {
          appItemType: "dictionary",
          id: breadcrumbs[0],
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "compileManuscript") {
        return {
          appItemType: "compileManuscript",
          id: breadcrumbs[0],
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "settings") {
        return {
          appItemType: "settings",
          id: null,
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "home") {
        return {
          appItemType: "home",
          id: null,
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [areaSelected, setAreaSelected] = useState("");

  const [{ isOverCurrent }, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem, monitor) => {
      if (!dndRef.current) return;

      if (!draggedItem.tabProps) return;

      if (
        equalityDeep(draggedItem.tabProps, { panelType, mode, breadcrumbs })
      ) {
        setAreaSelected("");
        return;
      }

      const tabDropIndex = tabs.findIndex((x) =>
        equalityDeep(x, { panelType, mode, breadcrumbs }),
      );

      const hoverBoundingRect = dndRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      const middle = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      const tabDraggedIndex = tabs.findIndex((x) =>
        equalityDeep(x, draggedItem.tabProps),
      );

      if (tabDraggedIndex !== -1) {
        if (hoverClientX < middle && tabDraggedIndex !== tabDropIndex - 1) {
          setAreaSelected("left");
        } else if (
          hoverClientX >= middle &&
          tabDraggedIndex !== tabDropIndex + 1
        ) {
          setAreaSelected("right");
        } else {
          setAreaSelected("");
        }
      } else {
        if (hoverClientX < middle) {
          setAreaSelected("left");
        } else if (hoverClientX >= middle) {
          setAreaSelected("right");
        } else {
          setAreaSelected("");
        }
      }
    },
    drop: (draggedItem, monitor) => {
      // If a nested drop already handled this event, do nothing.
      if (monitor.didDrop()) return;

      if (!dndRef.current) return;

      if (!draggedItem.tabProps) return;

      if (
        equalityDeep(draggedItem.tabProps, { panelType, mode, breadcrumbs })
      ) {
        setAreaSelected("");
        return;
      }

      const tabDropIndex = tabs.findIndex((x) =>
        equalityDeep(x, { panelType, mode, breadcrumbs }),
      );

      const tabDraggedIndex = tabs.findIndex((x) =>
        equalityDeep(x, draggedItem.tabProps),
      );

      const hoverBoundingRect = dndRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      const middle = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      if (tabDraggedIndex !== -1) {
        if (hoverClientX < middle && tabDraggedIndex !== tabDropIndex - 1) {
          const newTabs = JSON.parse(JSON.stringify(tabs));

          let element = newTabs[tabDraggedIndex];
          newTabs.splice(tabDraggedIndex, 1);
          newTabs.splice(tabDropIndex, 0, element);

          setTabs(newTabs);
        } else if (
          hoverClientX >= middle &&
          tabDraggedIndex !== tabDropIndex + 1
        ) {
          const newTabs = JSON.parse(JSON.stringify(tabs));

          let element = newTabs[tabDraggedIndex];
          newTabs.splice(tabDraggedIndex, 1);
          newTabs.splice(tabDropIndex + 1, 0, element);

          setTabs(newTabs);
        }
      } else {
        if (hoverClientX < middle && tabDraggedIndex !== tabDropIndex - 1) {
          const newTabs = JSON.parse(JSON.stringify(tabs));

          newTabs.splice(tabDropIndex, 0, draggedItem.tabProps);

          setTabs(newTabs);
        } else if (
          hoverClientX >= middle &&
          tabDraggedIndex !== tabDropIndex + 1
        ) {
          const newTabs = JSON.parse(JSON.stringify(tabs));

          newTabs.splice(tabDropIndex + 1, 0, draggedItem.tabProps);

          setTabs(newTabs);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  drag(drop(dndRef));

  useEffect(() => {
    const rootId = breadcrumbs[0];
    const youngestId = breadcrumbs[breadcrumbs.length - 1];
    const isAtRoot = youngestId === rootId;

    if (panelType === "libraries") {
      if (isAtRoot) {
        const callback = () => {
          setLabel(
            dataManagerSubdocs
              .getLibrary(rootId)
              .getMap("library_props")
              .get("item_properties")["item_title"],
          );
        };

        dataManagerSubdocs
          .getLibrary(rootId)
          .getMap("library_props")
          .observe(callback);

        callback();

        return () => {
          dataManagerSubdocs
            .getLibrary(rootId)
            .getMap("library_props")
            .unobserve(callback);
        };
      }

      if (
        !dataManagerSubdocs.getLibrary(rootId) ||
        !checkForYTree(
          dataManagerSubdocs.getLibrary(rootId).getMap("library_directory"),
        )
      ) {
        return null;
      }

      const ytree = new YTree(
        dataManagerSubdocs.getLibrary(rootId).getMap("library_directory"),
      );

      const itemMap = ytree.getNodeValueFromKey(youngestId);

      const callback = () => {
        setLabel(itemMap.get("item_properties")["item_title"]);
      };

      itemMap.observe(callback);

      callback();

      return () => {
        itemMap?.unobserve(callback);
      };
    } else if (panelType === "templates") {
      setIcon(<span className="icon-[carbon--template] w-full h-full"></span>);
      setLabel(rootId);
    } else if (panelType === "appThemes") {
      setIcon(<span className="icon-[carbon--template] w-full h-full"></span>);
      setLabel(rootId);
    } else if (panelType === "dictionary") {
      setIcon(
        <span className="icon-[material-symbols-light--match-word-rounded] w-full h-full"></span>,
      );
      setLabel("Dictionary");
    } else if (panelType === "compileManuscript") {
      setIcon(
        <span className="icon-[mdi--script-text-outline] w-full h-full"></span>,
      );
      setLabel("Compile");
    } else if (panelType === "settings") {
      setIcon(
        <span className="icon-[material-symbols-light--settings] w-full h-full"></span>,
      );
      setLabel("Settings");
    } else if (panelType === "home") {
      setIcon(
        <span className="icon-[material-symbols-light--home] w-full h-full mb-0.5"></span>,
      );
      setLabel("Home");
    }

    if (splitPanelTab && splitMode == "x") {
      setIcon(
        <span className="icon-[material-symbols-light--split-scene-left-outline] w-full h-full mb-0.5"></span>,
      );
    }

    if (splitPanelTab && splitMode == "y") {
      setIcon(
        <span className="icon-[material-symbols-light--split-scene-down-outline] w-full h-full mb-0.5"></span>,
      );
    }
  }, [panelType, breadcrumbs, splitMode, splitPanelTab]);

  const tabIsSelected = useMemo(() => {
    return equalityDeep(mainPanelState, {
      panelType,
      mode,
      breadcrumbs,
    });
  }, [panelType, mode, breadcrumbs, mainPanelState]);

  useEffect(() => {
    if (tabIsSelected) {
      dndRef.current?.scrollIntoView();
    }
  }, [tabIsSelected]);

  // Context Menu Logic
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConfirmDialog, _setDeleteConfirmDialog] = useState({
    open: false,
    itemId: null,
    itemType: null,
    itemTitle: null,
    libraryId: null,
  });
  const setDeleteConfirmDialog = (val) => _setDeleteConfirmDialog(val);
  const [deleteFromDrive, setDeleteFromDrive] = useState(false);
  const driveSyncLoading = appStore((state) => state.driveSyncLoading);
  const userProfile = oauthStore((state) => state.userProfile);
  const setFocusedItemId = appStore((state) => state.setFocusedItemId);

  const closeTab = useCallback(
    (index) => {
      const newTabs = [...tabs];
      newTabs.splice(index, 1);
      if (newTabs.length > 0) {
        setTabs(newTabs);
        if (tabs[index] && equalityDeep(tabs[index], mainPanelState)) {
          // If closing active tab, activate neighbor
          const nextTab = newTabs[index] || newTabs[index - 1];
          if (nextTab)
            activatePanel(nextTab.panelType, nextTab.mode, nextTab.breadcrumbs);
        }
      } else {
        // If all tabs closed? Usually we keep one or go home.
        // For now just empty tabs is fine or handled by store.
        setTabs([]);
        // optionally go home
        activatePanel("home", null, []);
      }
    },
    [tabs, setTabs, mainPanelState, activatePanel],
  );

  const closeOtherTabs = useCallback(
    (index) => {
      const tabToKeep = tabs[index];
      setTabs([tabToKeep]);
      activatePanel(tabToKeep.panelType, tabToKeep.mode, tabToKeep.breadcrumbs);
    },
    [tabs, setTabs, activatePanel],
  );

  const closeTabsRight = useCallback(
    (index) => {
      const newTabs = tabs.slice(0, index + 1);
      setTabs(newTabs);
      // If active tab was removed, activate the current index tab
      const activeIdx = tabs.findIndex((t) => equalityDeep(t, mainPanelState));
      if (activeIdx > index) {
        activatePanel(
          tabs[index].panelType,
          tabs[index].mode,
          tabs[index].breadcrumbs,
        );
      }
    },
    [tabs, setTabs, mainPanelState, activatePanel],
  );

  const closeTabsLeft = useCallback(
    (index) => {
      const newTabs = tabs.slice(index);
      setTabs(newTabs);
      // If active tab was removed, activate the now-first tab (which was index)
      const activeIdx = tabs.findIndex((t) => equalityDeep(t, mainPanelState));
      if (activeIdx < index) {
        activatePanel(
          tabs[index].panelType,
          tabs[index].mode,
          tabs[index].breadcrumbs,
        );
      }
    },
    [tabs, setTabs, mainPanelState, activatePanel],
  );

  const onRenameClick = useCallback(() => {
    setRenameValue(label);
    setIsRenaming(true);
  }, [label]);

  const handleRenameSave = useCallback(() => {
    if (panelType === "libraries") {
      const libraryId = breadcrumbs[0];
      const itemId =
        breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1] : null;

      if (libraryId && !itemId) {
        // Renaming Library
        if (renameValue.trim()) {
          const libraryYdoc = dataManagerSubdocs.getLibrary(libraryId);
          const libraryProps = libraryYdoc.getMap("library_props");
          const currentProperties = libraryProps.get("item_properties");
          libraryProps.set("item_properties", {
            ...currentProperties,
            item_title: renameValue.trim(),
          });
        }
      } else if (libraryId && itemId) {
        // Renaming Item
        if (renameValue.trim()) {
          const ytree = new YTree(
            dataManagerSubdocs
              .getLibrary(libraryId)
              .getMap("library_directory"),
          );
          const itemMap = ytree.getNodeValueFromKey(itemId);
          const currentProperties = itemMap.get("item_properties");
          itemMap.set("item_properties", {
            ...currentProperties,
            item_title: renameValue.trim(),
          });
        }
      }
    }
    setIsRenaming(false);
  }, [renameValue, panelType, breadcrumbs]);

  const handleRenameCancel = useCallback(() => {
    setIsRenaming(false);
  }, []);

  const options = useMemo(() => {
    const tabIndex = tabs.findIndex((x) =>
      equalityDeep(x, { panelType, mode, breadcrumbs }),
    );

    const generalOptions = [
      {
        label: "Select tab",
        icon: (
          <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: action,
      },
      {
        isDivider: true,
      },
      {
        label: "Close tab",
        icon: (
          <span className="icon-[iwwa--delete] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => closeTab(tabIndex),
        disabled: tabs.length <= 1,
      },
      {
        label: "Close other tabs",
        icon: (
          <span className="icon-[material-symbols-light--tab-close-right-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => closeOtherTabs(tabIndex),
        disabled: tabs.length <= 1,
      },
      {
        label: "Close tabs to the right",
        icon: (
          <span className="icon-[material-symbols-light--tab-close-right-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => closeTabsRight(tabIndex),
        disabled: tabIndex === tabs.length - 1,
      },
      {
        label: "Close tabs to the left",
        icon: (
          <span
            className="icon-[material-symbols-light--tab-close-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"
            style={{ transform: "scaleX(-1)" }}
          ></span>
        ),
        action: () => closeTabsLeft(tabIndex),
        disabled: tabIndex === 0,
      },
      {
        isDivider: true,
        label: "TabContextMenuDivider",
      },
      {
        label: "Open in split view (Horizontal)",
        icon: (
          <span className="icon-[material-symbols-light--split-scene-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => activateSplitPanel("x"),
      },
      {
        label: "Open in split view (Vertical)",
        icon: (
          <span className="icon-[material-symbols-light--split-scene-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight rotate-90"></span>
        ),
        action: () => activateSplitPanel("y"),
      },
    ];

    let itemOptions = [];

    if (panelType === "libraries") {
      const libraryId = breadcrumbs[0];
      const itemId =
        breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1] : null;

      if (libraryId && !itemId) {
        // Library Action
        itemOptions = [
          { isDivider: true },
          {
            label: "Rename",
            icon: (
              <span className="icon-[fluent--rename-a-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
            ),
            action: onRenameClick,
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
            label: "Delete",
            icon: (
              <span className="icon-[mdi--delete-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
            ),
            action: () => {
              setDeleteConfirmDialog({
                open: true,
                libraryId: libraryId,
                itemId: null,
                itemTitle: label,
                itemType: "library",
              });
            },
          },
        ];
      } else if (libraryId && itemId) {
        // Item Action
        try {
          const ytree = new YTree(
            dataManagerSubdocs
              .getLibrary(libraryId)
              .getMap("library_directory"),
          );
          const itemMap = ytree.getNodeValueFromKey(itemId);
          const type = itemMap.get("type");

          itemOptions.push({ isDivider: true });

          // Create/Edit options based on type
          if (type === "section" || type === "book") {
            itemOptions.push(
              {
                label: "Create section",
                icon: (
                  <span className="icon-[fluent--folder-add-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                ),
                action: () => {
                  const newId = dataManagerSubdocs.createEmptySection(
                    ytree,
                    itemId,
                  );
                  setFocusedItemId(newId);
                  activatePanel("libraries", "details", [libraryId, newId]);
                },
              },
              {
                label: "Create paper",
                icon: (
                  <span className="icon-[fluent--document-one-page-add-24-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                ),
                action: () => {
                  const newId = dataManagerSubdocs.createEmptyPaper(
                    ytree,
                    itemId,
                  );
                  setFocusedItemId(newId);
                  activatePanel("libraries", "details", [libraryId, newId]);
                },
              },
              {
                label: "Create Note",
                icon: (
                  <span className="icon-[fluent--document-one-page-add-24-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                ),
                action: () => {
                  const newId = dataManagerSubdocs.createEmptyNote(
                    ytree,
                    itemId,
                  );
                  setFocusedItemId(newId);
                  activatePanel("libraries", "details", [libraryId, newId]);
                },
              },
            );
          }

          // Rename for all items
          itemOptions.push({
            label: "Rename",
            icon: (
              <span className="icon-[fluent--rename-a-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
            ),
            action: onRenameClick,
          });

          // Export
          itemOptions.push({
            label: `Export ${type}`,
            icon: (
              <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
            ),
            action: () => {
              exportItem(ytree, itemId);
            },
          });

          // Delete
          itemOptions.push({
            label: "Delete",
            icon: (
              <span className="icon-[mdi--delete-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
            ),
            action: () => {
              setDeleteConfirmDialog({
                open: true,
                libraryId: libraryId,
                itemId: itemId,
                itemTitle: label,
                itemType: type,
              });
            },
          });
        } catch (e) {
          console.error("Error generating options for item tab", e);
        }
      }
    }

    return [...generalOptions, ...itemOptions];
  }, [
    tabs,
    panelType,
    breadcrumbs,
    mode,
    label,
    closeTab,
    closeOtherTabs,
    closeTabsRight,
    closeTabsLeft,
    activateSplitPanel,
    onRenameClick,
    action,
    activatePanel,
    setFocusedItemId,
  ]);

  return (
    <div
      ref={dndRef}
      className={`h-[85%] min-h-[85%] w-full flex items-center justify-start gap-1
          transition-colors duration-200  rounded-lg
          

          border

          ${isDragging && "opacity-30"} 

          ${(!isOverCurrent || (isOverCurrent && areaSelected === "")) && ""}
          
          ${
            isOverCurrent &&
            areaSelected === "left" &&
            `border-r-appLayoutBorder border-l-appLayoutHighlight`
          }
          
          ${
            isOverCurrent &&
            areaSelected === "right" &&
            `border-l-appLayoutBorder border-r-appLayoutHighlight`
          }
         
          ${
            tabIsSelected
              ? "border-appLayoutBorder bg-appBackground"
              : "border-transparent hover:bg-appLayoutInverseHover "
          }

        ${
          splitTab
            ? "border border-appLayoutBorder! bg-appBackground shadow-sm shadow-appLayoutGentleShadow"
            : ""
        }
        `}
    >
      <ContextMenuWrapper
        triggerClassname="grow basis-0 min-w-0 h-full min-h-full flex items-center justify-start overflow-hidden"
        options={options}
      >
        <button
          autoFocus
          onClick={action}
          className={`z-1 w-full h-full pl-1 flex items-center justify-start focus:-outline-offset-4  focus:outline-appLayoutTextMuted overflow-x-hidden overflow-y-hidden overflow-ellipsis`}
        >
          <span className="w-tabsIconSize h-tabsIconSize shrink-0">{icon}</span>
          <div className="grow min-w-0 px-1 basis-0 h-full flex items-center text-nowrap overflow-x-hidden overflow-y-hidden overflow-ellipsis text-tabsFontSize">
            {isRenaming ? (
              <input
                type="text"
                value={renameValue}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") {
                    handleRenameSave();
                  } else if (e.key === "Escape") {
                    handleRenameCancel();
                  }
                }}
                onBlur={handleRenameSave}
                className="w-full bg-appLayoutInputBackground border border-appLayoutBorder px-1 text-appLayoutText text-tabsFontSize focus:outline-none focus:border-appLayoutFocus rounded"
                autoFocus
              />
            ) : (
              label
            )}
          </div>
        </button>
      </ContextMenuWrapper>

      <DialogWrapper
        open={deleteConfirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmDialog({
              open: false,
              itemId: null,
              itemType: null,
              itemTitle: null,
              libraryId: null,
            });
          }
        }}
        title={`Delete ${deleteConfirmDialog.itemType === "library" ? "Library" : "Item"}`}
        description={`Are you sure you want to delete "${deleteConfirmDialog.itemTitle}"? This action cannot be undone.`}
        onSubmit={async () => {
          const { libraryId, itemId, itemType } = deleteConfirmDialog;
          if (itemType === "library") {
            await persistenceManagerForSubdocs.clearLocalPersistenceForYDoc(
              libraryId,
            );
            await persistenceManagerForSubdocs.closeConnectionForYDoc(
              libraryId,
            );
            await dataManagerSubdocs.destroyLibrary(libraryId);

            if (userProfile && deleteFromDrive) {
              const googleDriveManager =
                driveOrchestrator.getManager("googleDrive");
              googleDriveManager.stopSync(libraryId);
              googleDriveManager.deleteDocument(libraryId);
            }
            // Close tab if it was this library
            const idx = tabs.findIndex((t) => t.breadcrumbs[0] === libraryId);
            if (idx !== -1) closeTab(idx);
            // Also should go home?
          } else {
            if (libraryId && itemId) {
              const ytree = new YTree(
                dataManagerSubdocs
                  .getLibrary(libraryId)
                  .getMap("library_directory"),
              );
              dataManagerSubdocs.deleteItem(ytree, itemId);
              // Close tab?
              const idx = tabs.findIndex(
                (t) => t.breadcrumbs[t.breadcrumbs.length - 1] === itemId,
              );
              if (idx !== -1) closeTab(idx);
            }
          }

          setDeleteConfirmDialog({
            open: false,
            itemId: null,
            itemType: null,
            itemTitle: null,
            libraryId: null,
          });
        }}
        submitLabel="Delete"
        destructive={true}
        options={[
          ...(userProfile &&
          !driveSyncLoading &&
          deleteConfirmDialog.itemType === "library"
            ? [
                {
                  checked: deleteFromDrive,
                  label: "Delete from drive",
                  onChange: (e) => setDeleteFromDrive(e.target.checked),
                },
              ]
            : []),
        ]}
      />
      {isRemoveAvailable && (
        <button
          onClick={() => {
            if (splitPanelTab) {
              deactivateSplitPanel();
              return;
            }

            const newTabs = JSON.parse(JSON.stringify(tabs));
            const tabIndex = tabs.findIndex((x) =>
              equalityDeep(x, { panelType, mode, breadcrumbs }),
            );

            newTabs.splice(tabIndex, 1);

            if (newTabs.length > 0) {
              setTabs(newTabs);

              if (tabIndex > 0) {
                activatePanel(
                  newTabs[tabIndex - 1].panelType,
                  newTabs[tabIndex - 1].mode,
                  newTabs[tabIndex - 1].breadcrumbs,
                );
              } else {
                activatePanel(
                  newTabs[tabIndex].panelType,
                  newTabs[tabIndex].mode,
                  newTabs[tabIndex].breadcrumbs,
                );
              }
            }
          }}
          className={`min-w-tabsIconSize w-tabsIconSize h-tabsIconSize py-px  px-1 rounded-l-md hover:text-appLayoutHighlight ${
            !tabIsSelected
              ? "hover:bg-appBackgroundAccent"
              : "hover:bg-appLayoutInverseHover"
          }`}
        >
          <span className="icon-[iwwa--delete] w-full h-full"></span>
        </button>
      )}
    </div>
  );
};

TabButton.propTypes = {
  panelType: PropTypes.string.isRequired,
  mode: PropTypes.string,
  breadcrumbs: PropTypes.array.isRequired,
  action: PropTypes.func.isRequired,
  tabIsSelected: PropTypes.bool,
  isRemoveAvailable: PropTypes.bool,
  splitTab: PropTypes.bool,
  splitPanelTab: PropTypes.bool,
};

TabsBar.propTypes = {
  isNotesPanelAwake: PropTypes.bool,
  refreshNotesPanel: PropTypes.func,
};

const UnusedSpace = ({ offset = false }) => {
  const dndRef = useRef();

  /**
   * @type {Array<MainPanelState>}
   */
  const tabs = mainPanelStore((state) => state.tabs);

  const setTabs = mainPanelStore((state) => state.setTabs);

  const [isHovering, setIsHovering] = useState(false);

  const [{ isOverCurrent }, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem) => {
      if (!dndRef.current) return;

      if (!draggedItem.tabProps) return;

      if (equalityDeep(draggedItem.tabProps, tabs[tabs.length - 1])) {
        setIsHovering(false);
        return;
      }

      setIsHovering(true);
    },
    drop: (draggedItem, monitor) => {
      // If a nested drop already handled this event, do nothing.
      if (monitor.didDrop()) return;

      if (!dndRef.current) return;

      if (!draggedItem.tabProps) return;

      if (equalityDeep(draggedItem.tabProps, tabs[tabs.length - 1])) {
        setIsHovering(false);
        return;
      }

      const tabDraggedIndex = tabs.findIndex((x) =>
        equalityDeep(x, draggedItem.tabProps),
      );

      if (tabDraggedIndex !== -1) {
        const newTabs = JSON.parse(JSON.stringify(tabs));

        let element = newTabs[tabDraggedIndex];
        newTabs.splice(tabDraggedIndex, 1);
        newTabs.push(element);

        setTabs(newTabs);
      } else {
        const newTabs = JSON.parse(JSON.stringify(tabs));

        newTabs.push(draggedItem.tabProps);

        setTabs(newTabs);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  drop(dndRef);

  return (
    <div
      data-tauri-drag-region
      ref={dndRef}
      style={{
        height: "100%",
      }}
      className={`
        ${
          isOverCurrent && isHovering
            ? ` border-l border-l-appLayoutHighlight`
            : ""
        }

        
        ${offset ? "w-2" : "grow basis-0"}
        `}
    ></div>
  );
};

const NotesPanelOpenButton = ({ isNotesPanelAwake, refreshNotesPanel }) => {
  const setNotesPanelOpened = appStore((state) => state.setNotesPanelOpened);
  const notesPanelOpened = appStore((state) => state.notesPanelOpened);
  const isMd = appStore((state) => state.isMd);

  const mainPanelState = mainPanelStore((state) => state.mainPanelState);

  const { panelType } = mainPanelState;

  return (
    <AnimatePresence>
      {panelType === "libraries" && (
        <ActionButton
          onClick={() => {
            if (isMd) {
              setNotesPanelOpened(!notesPanelOpened);
            } else {
              if (!(notesPanelOpened && isNotesPanelAwake)) {
                setNotesPanelOpened(true);
                refreshNotesPanel();
              }
            }
          }}
        >
          <StyledTooltip label="Toggle Notes Panel">
            <div className={`h-full w-actionBarButtonIconSize relative`}>
              <AnimatePresence mode="wait">
                {notesPanelOpened && (isMd || isNotesPanelAwake) ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    key="homeButton"
                    className="icon-[solar--telescope-bold] w-[100%] h-[100%]"
                  ></motion.span>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    key="homeButton"
                    className="icon-[solar--telescope-bold-duotone] w-[100%] h-[100%]"
                  ></motion.span>
                )}
              </AnimatePresence>
            </div>
          </StyledTooltip>
        </ActionButton>
      )}
    </AnimatePresence>
  );
};

TabButton.propTypes = {
  panelType: PropTypes.string.isRequired,
  mode: PropTypes.string,
  breadcrumbs: PropTypes.array.isRequired,
  action: PropTypes.func.isRequired,
  tabIsSelected: PropTypes.bool,
  isRemoveAvailable: PropTypes.bool,
  splitTab: PropTypes.bool,
  splitPanelTab: PropTypes.bool,
};

TabsBar.propTypes = {
  isNotesPanelAwake: PropTypes.bool,
  refreshNotesPanel: PropTypes.func,
};

NotesPanelOpenButton.propTypes = {
  isNotesPanelAwake: PropTypes.bool.isRequired,
  refreshNotesPanel: PropTypes.func.isRequired,
};

UnusedSpace.propTypes = {
  offset: PropTypes.bool,
};
