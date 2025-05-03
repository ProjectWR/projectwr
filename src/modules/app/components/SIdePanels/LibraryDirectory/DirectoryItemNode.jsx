import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { YTree } from "yjs-orderedtree";
import { useDrag, useDrop } from "react-dnd";
import useYMap from "../../../hooks/useYMap";
import dataManagerSubdocs from "../../../lib/dataSubDoc";
import { appStore } from "../../../stores/appStore";
import { AnimatePresence, motion } from "motion/react";
import itemLocalStateManager from "../../../lib/itemLocalState";
import useOuterClick from "../../../../design-system/useOuterClick";
import { min, max } from "lib0/math";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import useComputedCssVar from "../../../hooks/useComputedCssVar";
import { ContextMenu } from "radix-ui";
import useStoreHistory from "../../../hooks/useStoreHistory";
import ContextMenuWrapper from "../../LayoutComponents/ContextMenuWrapper";
import useMainPanel from "../../../hooks/useMainPanel";

/**
 *
 * @param {{ytree: YTree, itemId: string}} param0
 * @returns
 */
const DirectoryItemNode = ({
  ytree,
  itemId,
  breadcrumbs,
  focusedItemId,
  setFocusedItemId,
  isChildOfRoot = true,
}) => {
  console.log("Directory item node rendered: ", itemId);
  const { deviceType } = useDeviceType();
  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const panelOpened = appStore((state) => state.panelOpened);

  const setItemId = appStore((state) => state.setItemId);
  const appStoreItemId = appStore((state) => state.appStoreItemId);

  const setItemMode = appStore((state) => state.setItemMode);
  const itemMode = appStore((state) => state.itemMode);

  const { activatePanel } = useMainPanel();

  const dndRef = useRef(null);

  // Get the node value map and determine its type.
  const itemMapRef = useRef(ytree.getNodeValueFromKey(itemId));

  const textContainerRef = useRef(null);
  const textRef = useRef(null);

  const computedLibraryDirectoryBookNodeFontSize = useComputedCssVar(
    "--libraryDirectoryBookNodeFontSize"
  );

  const itemMapState = useYMap(itemMapRef.current);

  const [nodeChildrenState, setNodeChildrenState] = useState(
    ytree.getNodeChildrenFromKey(itemId)
  );

  const [isOpened, setIsOpened] = useState(
    itemLocalStateManager.isItemOpened(itemId)
  );

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateisOpened = (isOpened) => {
      setIsOpened(isOpened);
    };

    const itemMap = itemMapRef.current;
    const type = itemMap.get("type");

    if (!itemLocalStateManager.hasItemLocalState(itemId)) {
      itemLocalStateManager.createItemLocalState(itemId, {
        type: type,
        libraryId: ytree._ydoc.guid,
      });
    }

    if (type === "section" || type === "book") {
      itemLocalStateManager.on(itemId, updateisOpened);
    }

    return () => {
      if (type === "section" || type === "book") {
        itemLocalStateManager.off(itemId, updateisOpened);
      }
    };
  }, [itemId]);

  // Update the header label (title) and children when the underlying Yjs node changes.
  useEffect(() => {
    const updateNodeChildrenState = () => {
      setNodeChildrenState(ytree.getNodeChildrenFromKey(itemId));
    };

    ytree.observe(updateNodeChildrenState);

    return () => {
      ytree.unobserve(updateNodeChildrenState);
    };
  }, [itemId, ytree]);

  const onCreateSectionClick = useCallback(() => {
    const newId = dataManagerSubdocs.createEmptySection(ytree, itemId);
    setIsOpened(true);
    itemLocalStateManager.setItemOpened(itemId, true);
    itemLocalStateManager.setItemOpened(newId, true);
  }, [ytree, itemId]);

  const onCreatePaperClick = useCallback(() => {
    const newId = dataManagerSubdocs.createEmptyPaper(ytree, itemId);
    setIsOpened(true);
    itemLocalStateManager.setItemOpened(itemId, true);
    itemLocalStateManager.setItemOpened(newId, true);
  }, [ytree, itemId]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ITEM",
    item: {
      id: itemMapRef.current.get("item_id"),
      type: itemMapRef.current.get("type"),
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

      if (draggedItem.id === itemId) {
        setIsSelfSelected(true);
      } else {
        setIsSelfSelected(false);
      }

      if (
        ytree.isNodeUnderOtherNode(
          ytree.computedMap.get(itemId),
          ytree.computedMap.get(draggedItem.id)
        )
      ) {
        setIsAncestor(true);
      } else {
        setIsAncestor(false);
      }

      console.log("ancestor: ", isAncestor, " self selected: ", isSelfSelected);

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
        setAreaSelected("middle");
      }
    },
    drop: (draggedItem, monitor) => {
      // If a nested drop already handled this event, do nothing.
      if (monitor.didDrop()) return;

      // if (draggedItem.id === itemId) {
      //   setIsSelfSelected(true);
      // } else {
      //   setIsSelfSelected(false);
      // }

      // if (ytree.isNodeUnderOtherNode(itemId, draggedItem.id)) {
      //   setIsAncestor(true);
      // } else {
      //   setIsAncestor(false);
      // }

      if (isAncestor || isSelfSelected) return;

      // Get the parent of the current node.
      const parentId = ytree.getNodeParentFromKey(itemId);
      const parentChildren = ytree.getNodeChildrenFromKey(parentId);

      const type = ytree.getNodeValueFromKey(draggedItem.id).get("type");

      if (areaSelected !== "middle") {
        if (parentChildren.includes(draggedItem.id)) {
          console.log("is sibling");

          if (areaSelected === "top") {
            ytree.setNodeBefore(draggedItem.id, itemId);
          }

          if (areaSelected === "bottom") {
            ytree.setNodeAfter(draggedItem.id, itemId);
          }
        } else {
          console.log("not sibling");
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
        console.log("dropped middle");
        if (type === "book") return;

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
            console.log("edit section details button");
            if (!(appStoreItemId === itemId && itemMode === "details")) {
              setItemId(itemId);
              setItemMode("details");

              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              activatePanel("libraries", "details", breadcrumbs);

              saveStateInHistory();
              clearFuture();
            }
          },
        },

        {
          label: "Create section",
          icon: (
            <span className="icon-[fluent--folder-add-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            console.log("create section button");
            onCreateSectionClick();
          },
        },

        {
          label: "Create paper",
          icon: (
            <span className="icon-[fluent--document-one-page-add-24-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            console.log("create paper button");
            onCreatePaperClick();
          },
        },

        {
          isDivider: true,
        },

        {
          label: `Export 
                  ${
                    itemMapRef.current.get("type") === "section" &&
                    "section as .docx"
                  }
                  ${
                    itemMapRef.current.get("type") === "book" && "book as .docx"
                  }`,
          icon: (
            <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),

          action: () => {
            console.log("export section button");

            dataManagerSubdocs.exportAllChildrenToDocx(ytree, itemId);
          },
        },
      ];
    }

    if (itemMapRef.current.get("type") === "paper") {
      return [
        {
          label: "Open",
          icon: (
            <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            console.log("edit paper editor button");
            if (
              !(
                appStoreItemId === itemId &&
                itemMode === "details" &&
                panelOpened
              )
            ) {
              setItemId(itemId);
              setItemMode("details");
              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              activatePanel("libraries", "details", breadcrumbs);

              saveStateInHistory();
              clearFuture();
            }
          },
        },

        {
          label: "Edit Paper Settings",
          icon: (
            <span className="icon-[hugeicons--customize] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            console.log("edit paper editor button");
            if (!(appStoreItemId === itemId && itemMode === "settings")) {
              setItemId(itemId);
              setItemMode("settings");
              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              activatePanel("libraries", "settings", breadcrumbs);

              saveStateInHistory();
              clearFuture();
            }
          },
        },

        {
          isDivider: true,
        },

        {
          label: "Export paper as .docx",
          icon: (
            <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            console.log("export paper button");
            dataManagerSubdocs.exportAllChildrenToDocx(ytree, itemId);
          },
        },

        {
          label: "Import paper",
          icon: (
            <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            console.log("import paper button");
            console.log(
              dataManagerSubdocs.setHtmlToPaper(
                ytree,
                itemId,
                "<p> Imported Content </p>"
              )
            );
          },
        },
      ];
    }
  }, [
    appStoreItemId,
    clearFuture,
    deviceType,
    itemId,
    itemMode,
    onCreatePaperClick,
    onCreateSectionClick,
    panelOpened,
    saveStateInHistory,
    setItemId,
    setItemMode,
    setPanelOpened,
    ytree,
    activatePanel,
    breadcrumbs,
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

        border-0

        ${(() => {
          if (!isSelfSelected && !isAncestor && isOverCurrent) {
            if (areaSelected === "top")
              return "border-t-2 border-t-appLayoutDirectoryNodeHover";
            if (areaSelected === "bottom")
              return "border-b-2 border-b-appLayoutDirectoryNodeHover";
            if (areaSelected === "middle")
              return "bg-appLayoutDirectoryNodeHover";
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
            if (type === "section")
              return "h-libraryDirectorySectionNodeHeight ";
            if (type === "book") return "h-libraryDirectoryBookNodeHeight";
            return "";
          })()}

          transition-colors
          duration-0

        `}
            onMouseEnter={() => {
              setIsHovered(true);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
            }}
          >
            {itemMapRef.current.get("type") == "paper" && (
              <>
                <></>
                <button
                  className="grow min-w-0 flex items-center justify-start h-full"
                  onClick={() => {
                    console.log("edit paper button");
                    if (
                      !(
                        appStoreItemId === itemId &&
                        itemMode === "details" &&
                        panelOpened
                      )
                    ) {
                      setItemId(itemId);
                      setItemMode("details");
                      if (deviceType === "mobile") {
                        setPanelOpened(false);
                      }

                      activatePanel("libraries", "details", breadcrumbs);

                      setPanelOpened(true);
                      saveStateInHistory();
                      clearFuture();
                    }
                  }}
                >
                  <div className="h-libraryDirectoryPaperNodeIconSize w-libraryDirectoryPaperNodeIconSize min-w-libraryDirectoryPaperNodeIconSize">
                    <motion.span
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`icon-[fluent--document-one-page-24-regular] h-full w-full`}
                    ></motion.span>
                  </div>

                  <div
                    ref={textContainerRef}
                    className="grow ml-1 text-libraryDirectoryBookNodeFontSize min-w-0 h-full flex items-center justify-start"
                  >
                    <span
                      ref={textRef}
                      className="w-fit max-w-full pt-[3px] overflow-hidden text-nowrap text-ellipsis"
                    >
                      {itemMapState.item_title}
                    </span>
                  </div>
                </button>
              </>
            )}

            {(itemMapRef.current.get("type") === "section" ||
              itemMapRef.current.get("type") === "book") && (
              <button
                className={`grow min-w-0 flex items-center justify-start h-full `}
                onClick={() => {
                  setFocusedItemId(itemId);
                  const newOpenedState = !isOpened;
                  setIsOpened(newOpenedState);
                  itemLocalStateManager.setItemOpened(itemId, newOpenedState);
                }}
              >
                <motion.span
                  animate={{ rotate: isOpened ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`icon-[formkit--right] ${(() => {
                    const type = itemMapRef.current.get("type");

                    if (type === "section")
                      return "h-libraryDirectorySectionNodeIconSize w-libraryDirectorySectionNodeIconSize min-w-libraryDirectorySectionNodeIconSize";
                    if (type === "book")
                      return "h-libraryDirectoryBookNodeIconSize w-libraryDirectoryBookNodeIconSize min-w-libraryDirectorySectionNodeIconSize";
                    return "";
                  })()}`}
                ></motion.span>

                <div
                  ref={textContainerRef}
                  className="grow ml-1 text-libraryDirectoryBookNodeFontSize min-w-0 h-full flex items-center justify-start"
                >
                  <span
                    ref={textRef}
                    className="w-fit max-w-full overflow-hidden text-nowrap text-ellipsis"
                  >
                    {itemMapState.item_title}
                  </span>
                </div>
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            className="w-full"
            key={isOpened ? "opened" : "closed"}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {isOpened &&
              (itemMapRef.current.get("type") === "section" ||
                itemMapRef.current.get("type") === "book") && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "fit-content", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  id="DirectoryItemNodeBodyContainer"
                  className={`w-full flex flex-row justify-start`}
                >
                  <div
                    style={{
                      marginLeft:
                        "calc(3px + var(--libraryDirectoryBookNodeIconSize) / 2)",
                    }}
                    className={`w-px flex items-center justify-center`}
                  >
                    <span className={`h-full w-full bg-appLayoutBorder`}></span>
                  </div>
                  <div
                    id="DirectoryItemNodeBody"
                    className="h-fit w-full grid grid-cols-1"
                  >
                    {nodeChildrenState !== null &&
                      ytree
                        .sortChildrenByOrder(nodeChildrenState, itemId)
                        .map((childKey) => (
                          <div id="DirectoryItemNodeChild" key={childKey}>
                            <DirectoryItemNode
                              ytree={ytree}
                              itemId={childKey}
                              breadcrumbs={[...breadcrumbs, childKey]}
                              setFocusedItemId={setFocusedItemId}
                              focusedItemId={focusedItemId}
                              isChildOfRoot={false}
                            />
                          </div>
                        ))}
                  </div>
                </motion.div>
              )}
          </motion.div>
        </AnimatePresence>
      </div>
    </ContextMenuWrapper>
  );
};

DirectoryItemNode.propTypes = {
  ytree: PropTypes.object.isRequired,
  itemId: PropTypes.string.isRequired,
};

export default DirectoryItemNode;
