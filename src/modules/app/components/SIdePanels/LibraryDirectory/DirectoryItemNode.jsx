import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import useYMap from "../../../hooks/useYMap";
import dataManagerSubdocs from "../../../lib/dataSubDoc";
import { appStore } from "../../../stores/appStore";
import { AnimatePresence, motion } from "motion/react";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import ContextMenuWrapper from "../../LayoutComponents/ContextMenuWrapper";
import DialogWrapper from "../../LayoutComponents/DialogWrapper";
import useMainPanel from "../../../hooks/useMainPanel";
import { exportItem } from "../../../lib/importExport";
import { Checkbox } from "@mantine/core";

/**
 *
 * @param {{ytree: YTree, itemId: string}} param0
 * @returns
 */
const DirectoryItemNode = ({
  libraryId,
  ytree,
  itemId,
  breadcrumbs,
  focusedItemId,
  setFocusedItemId,
  isChildOfRoot = true,
  sortedDescendants,
}) => {
  // console.log("Directory item node rendered: ", itemId);
  const { deviceType } = useDeviceType();
  // const { saveStateInHistory } = useStoreHistory();

  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const panelOpened = appStore((state) => state.panelOpened);

  const setItemId = appStore((state) => state.setItemId);
  const appStoreItemId = appStore((state) => state.appStoreItemId);

  const setItemMode = appStore((state) => state.setItemMode);
  const itemMode = appStore((state) => state.itemMode);

  const { activatePanel } = useMainPanel();

  const deleteConfirmDontAskAgain = appStore(
    (state) => state.deleteConfirmDontAskAgain,
  );
  const setDeleteConfirmDontAskAgain = appStore(
    (state) => state.setDeleteConfirmDontAskAgain,
  );

  const dndRef = useRef(null);

  // Get the node value map and determine its type.
  const itemMapRef = useRef(ytree.getNodeValueFromKey(itemId));

  const itemMapState = useYMap(itemMapRef.current);

  // const [nodeChildrenState, setNodeChildrenState] = useState(
  //   ytree.getNodeChildrenFromKey(itemId)
  // );

  const nodeChildrenStates = useMemo(() => {
    return sortedDescendants.get(itemId)?.sortedChildren || [];
  }, [sortedDescendants, itemId]);

  const [isOpened, setIsOpened] = useState(false);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    open: false,
    itemId: null,
    itemType: null,
    itemTitle: null,
  });

  useEffect(() => {
    if (focusedItemId === itemId) {
      dndRef.current?.scrollIntoView();
    }
  }, [focusedItemId, itemId]);

  const onCreateSectionClick = useCallback(() => {
    const newId = dataManagerSubdocs.createEmptySection(ytree, itemId);
    setIsOpened(true);
    setFocusedItemId(newId);
    activatePanel("libraries", "details", [libraryId, newId]);
  }, [ytree, itemId, libraryId, setFocusedItemId, activatePanel]);

  const onCreatePaperClick = useCallback(() => {
    const newId = dataManagerSubdocs.createEmptyPaper(ytree, itemId);
    setIsOpened(true);
    setFocusedItemId(newId);
    activatePanel("libraries", "details", [libraryId, newId]);
  }, [ytree, itemId, libraryId, setFocusedItemId, activatePanel]);

  const onCreateNoteClick = useCallback(() => {
    const newId = dataManagerSubdocs.createEmptyNote(ytree, itemId);
    setIsOpened(true);
    setFocusedItemId(newId);
    activatePanel("libraries", "details", [libraryId, newId]);
  }, [ytree, itemId, libraryId, setFocusedItemId, activatePanel]);

  const onRenameClick = useCallback(() => {
    setRenameValue(itemMapState.item_properties.item_title);
    setIsRenaming(true);
  }, [itemMapState.item_properties.item_title]);

  const handleRenameSave = useCallback(() => {
    if (
      renameValue.trim() &&
      renameValue !== itemMapState.item_properties.item_title
    ) {
      const itemMap = itemMapRef.current;
      const currentProperties = itemMap.get("item_properties");
      itemMap.set("item_properties", {
        ...currentProperties,
        item_title: renameValue.trim(),
      });
    }
    setIsRenaming(false);
  }, [renameValue, itemMapState.item_properties.item_title]);

  const handleRenameCancel = useCallback(() => {
    setIsRenaming(false);
  }, []);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ITEM",
    item: {
      appItemType: "libraries",
      id: itemMapRef.current.get("item_id"),
      type: itemMapRef.current.get("type"),
      libraryId: libraryId,
      tabProps: {
        panelType: "libraries",
        mode: "details",
        breadcrumbs: [libraryId, itemId],
      },
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // "areaSelected" determines the hover area: top, middle, or bottom.
  const [areaSelected, setAreaSelected] = useState("top");
  const [isSelfSelected, setIsSelfSelected] = useState(false);
  const [isAncestor, setIsAncestor] = useState(false);

  const [{ isOverCurrent }, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem, monitor) => {
      if (!dndRef.current) return;
      const currentItemType = itemMapRef.current.get("type");

      if (draggedItem.appItemType !== "libraries") {
        setAreaSelected("");
        return;
      }
      if (draggedItem.id === itemId) {
        setIsSelfSelected(true);
      } else {
        setIsSelfSelected(false);
      }

      if (
        ytree.isNodeUnderOtherNode(
          ytree.computedMap.get(itemId),
          ytree.computedMap.get(draggedItem.id),
        )
      ) {
        setIsAncestor(true);
      } else {
        setIsAncestor(false);
      }

      const type = ytree.getNodeValueFromKey(draggedItem.id).get("type");

      if (isAncestor || isSelfSelected) return;

      const hoverBoundingRect = dndRef.current.getBoundingClientRect();
      const buffer = 10; // pixels to define the top/bottom sensitive area
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (hoverClientY < buffer) {
        setAreaSelected("top");
      } else if (hoverClientY > hoverBoundingRect.height - buffer) {
        setAreaSelected("bottom");
      } else {
        if (
          type === "book" ||
          currentItemType === "paper" ||
          currentItemType === "note"
        )
          return;

        setAreaSelected("middle");
      }
    },
    drop: (draggedItem, monitor) => {
      // If a nested drop already handled this event, do nothing.
      if (monitor.didDrop()) return;

      if (draggedItem.appItemType !== "libraries") {
        setAreaSelected("");
        return;
      }

      if (isAncestor || isSelfSelected) return;

      // Get the parent of the current node.
      const parentId = ytree.getNodeParentFromKey(itemId);
      const parentChildren = ytree.getNodeChildrenFromKey(parentId);

      const type = ytree.getNodeValueFromKey(draggedItem.id).get("type");

      const currentItemType = itemMapRef.current.get("type");

      if (areaSelected !== "middle") {
        if (parentChildren.includes(draggedItem.id)) {
          if (areaSelected === "top") {
            ytree.setNodeBefore(draggedItem.id, itemId);
          }

          if (areaSelected === "bottom") {
            ytree.setNodeAfter(draggedItem.id, itemId);
          }
        } else {
          if (type === "book") return;

          ytree.moveChildToParent(draggedItem.id, parentId);

          if (areaSelected === "top") {
            ytree.setNodeBefore(draggedItem.id, itemId);
          }

          if (areaSelected === "bottom") {
            ytree.setNodeAfter(draggedItem.id, itemId);
          }
        }
      } else {
        if (
          type === "book" ||
          currentItemType === "paper" ||
          currentItemType === "note"
        )
          return;

        if (ytree.getNodeChildrenFromKey(itemId).includes(draggedItem.id)) {
          ytree.setNodeOrderToEnd(draggedItem.id, itemId);
        } else {
          ytree.moveChildToParent(draggedItem.id, itemId);
          ytree.setNodeOrderToEnd(draggedItem.id, itemId);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  // Connect the ref to both drag and drop.
  drag(drop(dndRef));

  const options = useMemo(() => {
    if (
      itemMapRef.current.get("type") === "section" ||
      itemMapRef.current.get("type") === "book"
    ) {
      return [
        {
          label: "Edit",
          icon: (
            <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            if (!(appStoreItemId === itemId && itemMode === "details")) {
              setItemId(itemId);
              setFocusedItemId(itemId);
              setItemMode("details");

              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              activatePanel("libraries", "details", [libraryId, itemId]);
            }
          },
        },

        {
          label: "Create section",
          icon: (
            <span className="icon-[fluent--folder-add-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            onCreateSectionClick();
          },
        },

        {
          label: "Create paper",
          icon: (
            <span className="icon-[fluent--document-one-page-add-24-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            onCreatePaperClick();
          },
        },

        {
          label: "Create Note",
          icon: (
            <span className="icon-[fluent--document-one-page-add-24-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            onCreateNoteClick();
          },
        },

        {
          label: `Export 
          ${itemMapRef.current.get("type") === "section" ? "section" : ""}
          ${itemMapRef.current.get("type") === "book" ? "book" : ""}
          `,
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
          action: () => {
            if (deleteConfirmDontAskAgain) {
              // Skip confirmation dialog and delete directly
              dataManagerSubdocs.deleteItem(ytree, itemId);
            } else {
              // Show confirmation dialog
              setDeleteConfirmDialog({
                open: true,
                itemId: itemId,
                itemType: itemMapRef.current.get("type"),
                itemTitle: itemMapState.item_properties.item_title,
              });
            }
          },
        },
      ];
    }

    if (itemMapRef.current.get("type") === "paper") {
      return [
        {
          label: "Edit",
          icon: (
            <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            if (
              !(
                appStoreItemId === itemId &&
                itemMode === "details" &&
                panelOpened
              )
            ) {
              setItemId(itemId);
              setFocusedItemId(itemId);
              setItemMode("details");
              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              activatePanel("libraries", "details", [libraryId, itemId]);
            }
          },
        },

        {
          label: "Export paper",
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
          action: () => {
            if (deleteConfirmDontAskAgain) {
              // Skip confirmation dialog and delete directly
              dataManagerSubdocs.deleteItem(ytree, itemId);
            } else {
              // Show confirmation dialog
              setDeleteConfirmDialog({
                open: true,
                itemId: itemId,
                itemType: itemMapRef.current.get("type"),
                itemTitle: itemMapState.item_properties.item_title,
              });
            }
          },
        },
      ];
    }

    if (itemMapRef.current.get("type") === "note") {
      return [
        {
          label: "Edit",
          icon: (
            <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            if (
              !(
                appStoreItemId === itemId &&
                itemMode === "details" &&
                panelOpened
              )
            ) {
              setItemId(itemId);
              setFocusedItemId(itemId);
              setItemMode("details");
              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              activatePanel("libraries", "details", [libraryId, itemId]);
            }
          },
        },

        {
          label: "Export note",
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
          action: () => {
            if (deleteConfirmDontAskAgain) {
              // Skip confirmation dialog and delete directly
              dataManagerSubdocs.deleteItem(ytree, itemId);
            } else {
              // Show confirmation dialog
              setDeleteConfirmDialog({
                open: true,
                itemId: itemId,
                itemType: itemMapRef.current.get("type"),
                itemTitle: itemMapState.item_properties.item_title,
              });
            }
          },
        },
      ];
    }
  }, [
    appStoreItemId,
    deviceType,
    itemId,
    itemMode,
    onCreatePaperClick,
    onCreateSectionClick,
    onRenameClick,
    panelOpened,
    setItemId,
    setFocusedItemId,
    setItemMode,
    onCreateNoteClick,
    setPanelOpened,
    ytree,
    activatePanel,
    libraryId,
  ]);

  return (
    <ContextMenuWrapper triggerClassname="w-full h-fit" options={options}>
      <div
        id="DirectoryItemNodeContainer"
        ref={dndRef}
        className={`
        flex flex-col

        w-full h-fit
         
        ${isDragging ? "opacity-20" : ""}

        border-y-transparent

        ${(() => {
            if (!isSelfSelected && !isAncestor && isOverCurrent) {
              if (areaSelected === "top")
                return "border-y-2 border-t-appLayoutDirectoryNodeHover border-b-transparent";
              if (areaSelected === "bottom")
                return "border-y-2 border-b-appLayoutDirectoryNodeHover border-t-transparent";
              if (areaSelected === "middle")
                return "bg-appLayoutDirectoryNodeHover border-y-0";
            }
            return "";
          })()}

          `}
      >
        <AnimatePresence mode="wait">
          <motion.div
            id="DirectoryItemNodeHeader"
            key={`itemNodeHeader-${itemId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
            className={`flex justify-between items-center  hover:bg-appLayoutHover
            pl-1
            ${focusedItemId === itemId ? "bg-appLayoutHover" : ""} 
            
            rounded-r-sm
            ${isChildOfRoot && "rounded-l-sm"}

            ${(() => {
                const type = itemMapRef.current.get("type");
                if (type === "paper") return "h-libraryDirectoryPaperNodeHeight ";
                if (type === "note") return "h-libraryDirectoryPaperNodeHeight ";
                if (type === "section")
                  return "h-libraryDirectorySectionNodeHeight ";
                if (type === "book") return "h-libraryDirectoryBookNodeHeight";
                return "";
              })()}

              transition-colors
              duration-0

        `}
          >
            {itemMapRef.current.get("type") == "paper" && (
              <>
                <></>
                <button
                  className="grow min-w-0 flex items-center justify-start h-full"
                  onClick={() => {
                    if (isRenaming) return;
                    if (
                      !(
                        appStoreItemId === itemId &&
                        itemMode === "details" &&
                        panelOpened
                      )
                    ) {
                      if (deviceType === "mobile") {
                        setPanelOpened(false);
                      }

                      activatePanel("libraries", "details", [
                        libraryId,
                        itemId,
                      ]);

                      setPanelOpened(true);
                    }
                  }}
                >
                  <div className="h-libraryDirectoryPaperNodeIconSize flex items-center w-libraryDirectoryPaperNodeIconSize p-px min-w-libraryDirectoryPaperNodeIconSize">
                    <motion.span
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`icon-[fluent--document-one-page-24-regular] h-full w-full`}
                    ></motion.span>
                  </div>

                  <div className="grow ml-1 text-libraryDirectoryBookNodeFontSize min-w-0 h-full flex items-center justify-start">
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
                        className="w-full bg-appLayoutInputBackground border border-appLayoutBorder rounded px-1 text-appLayoutText text-libraryDirectoryBookNodeFontSize focus:outline-none focus:border-appLayoutFocus"
                        autoFocus
                      />
                    ) : (
                      <span className="w-fit max-w-full overflow-hidden text-nowrap text-ellipsis">
                        {itemMapState.item_properties.item_title}
                      </span>
                    )}
                  </div>
                </button>
              </>
            )}

            {itemMapRef.current.get("type") == "note" && (
              <>
                <></>
                <button
                  className="grow min-w-0 flex items-center justify-start h-full"
                  onClick={() => {
                    if (isRenaming) return;
                    if (
                      !(
                        appStoreItemId === itemId &&
                        itemMode === "details" &&
                        panelOpened
                      )
                    ) {
                      if (deviceType === "mobile") {
                        setPanelOpened(false);
                      }

                      activatePanel("libraries", "details", [
                        libraryId,
                        itemId,
                      ]);

                      setPanelOpened(true);
                    }
                  }}
                >
                  <div className="h-libraryDirectoryPaperNodeIconSize w-libraryDirectoryPaperNodeIconSize min-w-libraryDirectoryPaperNodeIconSize p-px flex items-center justify-center">
                    <motion.span
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`icon-[fluent--square-20-regular] h-full w-full `}
                    ></motion.span>
                  </div>

                  <div className="grow ml-1 text-libraryDirectoryBookNodeFontSize min-w-0 h-full flex items-center justify-start">
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
                        className="w-full bg-appLayoutInputBackground border border-appLayoutBorder px-1 text-appLayoutText text-libraryDirectoryBookNodeFontSize focus:outline-none focus:border-appLayoutFocus"
                        autoFocus
                      />
                    ) : (
                      <span className="w-fit max-w-full overflow-hidden text-nowrap text-ellipsis">
                        {itemMapState.item_properties.item_title}
                      </span>
                    )}
                  </div>
                </button>
              </>
            )}

            {itemMapRef.current.get("type") == "section" && (
              <>
                <button
                  className="grow min-w-0 flex items-center justify-start h-full"
                  onClick={() => {
                    setIsOpened(!isOpened);
                  }}
                >
                  <div className="h-libraryDirectorySectionNodeIconSize w-libraryDirectorySectionNodeIconSize min-w-libraryDirectorySectionNodeIconSize">
                    <motion.span
                      animate={{ rotate: isOpened ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`icon-[uiw--right] h-[95%] w-[95%]`}
                    ></motion.span>
                  </div>

                  <div className="grow ml-1 text-libraryDirectorySectionNodeFontSize min-w-0 h-full flex items-center justify-start">
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
                        className="w-full bg-appLayoutInputBackground border border-appLayoutBorder px-1 text-appLayoutText text-libraryDirectorySectionNodeFontSize focus:outline-none focus:border-appLayoutFocus"
                        autoFocus
                      />
                    ) : (
                      <span className="w-fit max-w-full overflow-hidden text-nowrap text-ellipsis">
                        {itemMapState.item_properties.item_title}
                      </span>
                    )}
                  </div>
                </button>
              </>
            )}

            {itemMapRef.current.get("type") == "book" && (
              <>
                <button
                  className="grow min-w-0 flex items-center justify-start h-full"
                  onClick={() => {
                    setIsOpened(!isOpened);
                  }}
                >
                  <div className="h-libraryDirectoryBookNodeIconSize w-libraryDirectoryBookNodeIconSize min-w-libraryDirectoryBookNodeIconSize">
                    <motion.span
                      animate={{ rotate: isOpened ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`icon-[uiw--right] h-[95%] w-[95%]`}
                    ></motion.span>
                  </div>

                  <div className="min-w-0 basis-0 grow ml-1 text-libraryDirectoryBookNodeFontSize font-bold min-w-0 h-full flex items-center justify-start">
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
                        className="w-full bg-appLayoutInputBackground border border-appLayoutBorder px-1 text-appLayoutText text-libraryDirectoryBookNodeFontSize focus:outline-none focus:border-appLayoutFocus"
                        autoFocus
                      />
                    ) : (
                      <span className="w-fit max-w-full overflow-hidden text-nowrap text-ellipsis">
                        {itemMapState.item_properties.item_title}
                      </span>
                    )}
                  </div>
                </button>
              </>
            )}

            <div
              id="DirectoryItemNodeActions"
              className="h-full w-fit flex items-center justify-end px-1 gap-1"
            >
              {(itemMapRef.current.get("type") === "section" ||
                itemMapRef.current.get("type") === "book") && (
                  <button
                    className="h-libraryDirectoryActionIconSize w-libraryDirectoryActionIconSize rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center"
                    onClick={onCreatePaperClick}
                  >
                    <span className="icon-[fluent--document-add-24-regular] w-full h-full"></span>
                  </button>
                )}
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {isOpened && (
            <motion.div
              id="DirectoryItemNodeChildren"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              style={{
                marginLeft: "calc(0.25rem + var(--spacing-libraryDirectoryBookNodeIconSize) / 2)"
              }}
              className="overflow-hidden border-l border-appLayoutBorder "
            >
              {nodeChildrenStates.map((childId) => (
                <DirectoryItemNode
                  key={childId}
                  libraryId={libraryId}
                  ytree={ytree}
                  itemId={childId}
                  breadcrumbs={[...breadcrumbs, itemId]}
                  focusedItemId={focusedItemId}
                  setFocusedItemId={setFocusedItemId}
                  isChildOfRoot={false}
                  sortedDescendants={sortedDescendants}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DialogWrapper
        open={deleteConfirmDialog.open}
        onClose={() =>
          setDeleteConfirmDialog({ ...deleteConfirmDialog, open: false })
        }
        title={`Delete ${deleteConfirmDialog.itemType}?`}
      >
        <div className="flex flex-col gap-4">
          <p>
            Are you sure you want to delete{" "}
            <b>{deleteConfirmDialog.itemTitle}</b>? This action cannot be
            undone.
          </p>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={deleteConfirmDontAskAgain}
              onChange={(e) =>
                setDeleteConfirmDontAskAgain(e.currentTarget.checked)
              }
              label="Don't ask me again"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded bg-appLayoutBorder hover:bg-appLayoutHover"
              onClick={() =>
                setDeleteConfirmDialog({ ...deleteConfirmDialog, open: false })
              }
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                dataManagerSubdocs.deleteItem(
                  ytree,
                  deleteConfirmDialog.itemId,
                );
                setDeleteConfirmDialog({ ...deleteConfirmDialog, open: false });
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </DialogWrapper>
    </ContextMenuWrapper>
  );
};

DirectoryItemNode.propTypes = {
  libraryId: PropTypes.string.isRequired,
  ytree: PropTypes.object.isRequired,
  itemId: PropTypes.string.isRequired,
  breadcrumbs: PropTypes.array.isRequired,
  focusedItemId: PropTypes.string,
  setFocusedItemId: PropTypes.func.isRequired,
  isChildOfRoot: PropTypes.bool,
  sortedDescendants: PropTypes.object.isRequired,
};

export default DirectoryItemNode;
