import React, { useRef, useState, useEffect, useCallback } from "react";
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

/**
 *
 * @param {{ytree: YTree, itemId: string}} param0
 * @returns
 */
const DirectoryItemNode = ({
  ytree,
  itemId,
  focusedItemId,
  setFocusedItemId,
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

  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger className={`w-full h-fit`}>
        <div
          id="DirectoryItemNodeContainer"
          ref={dndRef}
          className={`
        flex flex-col

        w-full h-fit
         
        ${isDragging ? "opacity-20" : ""}

        border border-transparent

        ${(() => {
          if (!isSelfSelected && !isAncestor && isOverCurrent) {
            if (areaSelected === "top")
              return "border-t border-b border-t-appLayoutDirectoryNodeHover";
            if (areaSelected === "bottom")
              return "border-b border-t border-b-appLayoutDirectoryNodeHover";
            if (areaSelected === "middle")
              return "bg-appLayoutDirectoryNodeHover";
          }
          return "border-y border-appBackground";
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
            rounded-md

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
                    className="flex-grow min-w-0 flex items-center justify-start h-full"
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

                        setPanelOpened(true);
                        saveStateInHistory();
                        clearFuture();
                      }
                    }}
                  >
                    <div className="h-libraryDirectoryPaperNodeIconSize w-libraryDirectoryPaperNodeIconSize min-w-libraryDirectoryPaperNodeIconSize p-1">
                      <motion.span
                        animate={{ rotate: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`icon-[fluent--document-one-page-24-regular] h-full w-full`}
                      ></motion.span>
                    </div>

                    <div
                      ref={textContainerRef}
                      className="flex-grow text-libraryDirectoryBookNodeFontSize min-w-0 h-full flex items-center justify-start"
                    >
                      <span
                        ref={textRef}
                        className="w-fit max-w-full overflow-hidden text-nowrap overflow-ellipsis"
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
                  className={`flex-grow min-w-0 flex items-center justify-start h-full`}
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
                    className={`icon-[material-symbols-light--keyboard-arrow-right] ${(() => {
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
                    className="flex-grow text-libraryDirectoryBookNodeFontSize min-w-0 h-full flex items-center justify-start"
                  >
                    <span
                      ref={textRef}
                      className="w-fit max-w-full overflow-hidden text-nowrap overflow-ellipsis"
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
                      <span
                        className={`h-full w-full bg-appLayoutBorder`}
                      ></span>
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
                                setFocusedItemId={setFocusedItemId}
                                focusedItemId={focusedItemId}
                              />
                            </div>
                          ))}
                    </div>
                  </motion.div>
                )}
            </motion.div>
          </AnimatePresence>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className="ContextMenuContent"
          sideOffset={5}
          align="end"
        >
          {(itemMapRef.current.get("type") === "section" ||
            itemMapRef.current.get("type") === "book") && (
            <>
              <ContextMenu.Item
                className="ContextMenuItem"
                onClick={() => {
                  console.log("edit section details button");
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

                    setPanelOpened(true);
                    saveStateInHistory();
                    clearFuture();
                  }
                }}
              >
                <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                <span>
                  Edit{" "}
                  {itemMapRef.current.get("type") === "section" && "section"}{" "}
                  {itemMapRef.current.get("type") === "book" && "book"} details
                </span>
              </ContextMenu.Item>{" "}
              <ContextMenu.Item
                className="ContextMenuItem"
                onClick={() => {
                  console.log("create section button");
                  onCreateSectionClick();
                }}
              >
                <span className="icon-[fluent--folder-add-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                <span>Create section</span>
              </ContextMenu.Item>
              <ContextMenu.Item
                className="ContextMenuItem"
                onClick={() => {
                  console.log("create paper button");
                  onCreatePaperClick();
                }}
              >
                <span className="icon-[fluent--document-one-page-add-24-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                <span>Create paper</span>
              </ContextMenu.Item>
              <ContextMenu.Separator className="ContextMenuSeparator" />
              <ContextMenu.Item
                className="ContextMenuItem"
                onClick={() => {
                  console.log("export section button");

                  dataManagerSubdocs.exportAllChildrenToDocx(ytree, itemId);
                }}
              >
                <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                <span>
                  Export{" "}
                  {itemMapRef.current.get("type") === "section" &&
                    "section as .docx"}
                  {itemMapRef.current.get("type") === "book" && "book as .docx"}
                </span>
              </ContextMenu.Item>
            </>
          )}

          {itemMapRef.current.get("type") === "paper" && (
            <>
              <ContextMenu.Item
                className="ContextMenuItem"
                onClick={() => {
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

                    setPanelOpened(true);
                    saveStateInHistory();
                    clearFuture();
                  }
                }}
              >
                <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                <span>Open</span>
              </ContextMenu.Item>{" "}
              <ContextMenu.Item
                className="ContextMenuItem"
                onClick={() => {
                  console.log("edit paper editor button");
                  if (
                    !(
                      appStoreItemId === itemId &&
                      itemMode === "settings" &&
                      panelOpened
                    )
                  ) {
                    setItemId(itemId);
                    setItemMode("settings");
                    if (deviceType === "mobile") {
                      setPanelOpened(false);
                    }

                    setPanelOpened(true);
                    saveStateInHistory();
                    clearFuture();
                  }
                }}
              >
                <span className="icon-[hugeicons--customize] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                <span>Edit Paper Settings</span>
              </ContextMenu.Item>{" "}
              <ContextMenu.Separator className="ContextMenuSeparator" />
              <ContextMenu.Item
                className="ContextMenuItem"
                onClick={() => {
                  console.log("export paper button");
                  dataManagerSubdocs.exportAllChildrenToDocx(ytree, itemId);
                }}
              >
                <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                <span>Export paper as .docx</span>
              </ContextMenu.Item>
              <ContextMenu.Item
                className="ContextMenuItem"
                onClick={() => {
                  console.log("import paper button");
                  console.log(
                    dataManagerSubdocs.setHtmlToPaper(
                      ytree,
                      itemId,
                      "<p> Imported Content </p>"
                    )
                  );
                }}
              >
                <span className="icon-[ph--upload-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                <span>Import .docx as paper</span>
              </ContextMenu.Item>
            </>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};

DirectoryItemNode.propTypes = {
  ytree: PropTypes.object.isRequired,
  itemId: PropTypes.string.isRequired,
};

export default DirectoryItemNode;

const OptionsButton = ({
  options,
  className,
  buttonIcon,
  origin = "topRight",
  mainButtonHovered,
}) => {
  const [isOpened, setIsOpened] = useState(false);

  const buttonContainerRef = useOuterClick(() => {
    setIsOpened(false);
  });

  const buttonRef = useRef(null);

  const [shouldDropdownGoUp, setShouldDropdownGoUp] = useState(false);
  const [top, setTop] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpened) {
      if (dropdownRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const containerRect = document
          .querySelector("#libraryDirectoryBody")
          .getBoundingClientRect();

        console.log("all rects: ", buttonRect, dropdownRect, containerRect);

        console.log("button rect something: ", buttonRect.top + window.scrollY);

        const bottomLimit = containerRect.bottom;
        const bottomOfDropdown =
          buttonRect.top + window.scrollY + dropdownRect.height * 2 + 3;

        const distanceOverflowed = bottomOfDropdown - bottomLimit;

        console.log("values: ", bottomLimit, bottomOfDropdown);

        if (distanceOverflowed > 0) {
          setShouldDropdownGoUp(true);
          setTop(0 - distanceOverflowed);
        } else {
          setShouldDropdownGoUp(false);
          setTop(3);
        }
      }
    }
  }, [isOpened]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      ref={buttonContainerRef}
      className={`relative w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-0 p-1
                  text-appLayoutText bg-appBackground rounded-lg
                  ${
                    isOpened
                      ? "bg-appLayoutPressed text-appLayoutHighlight shadow-inner shadow-appLayoutShadow"
                      : "hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight"
                  }

                  flex items-center justify-center

                  ${mainButtonHovered && "bg-appLayoutHover"}

                  ${className}
      `}
    >
      <button
        ref={buttonRef}
        className="w-full h-full p-1"
        onClick={() => {
          setIsOpened(!isOpened);
        }}
      >
        {buttonIcon}
      </button>
      <AnimatePresence>
        {isOpened && (
          <motion.div
            ref={dropdownRef}
            style={{ top: `${top}px` }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ ease: "easeOut", duration: 0.1 }}
            className={`z-[100] absolute h-fit w-optionsDropdownWidth max-w-optionsDropdownWidth overflow-hidden flex flex-col items-center 
                       rounded-md bg-appBackground border border-appLayoutBorder shadow-md shadow-appLayoutGentleShadow 
                       ${
                         shouldDropdownGoUp
                           ? `                      
                              ${
                                origin === "topRight" &&
                                "origin-bottom-right right-0"
                              } 
                              ${origin === "topMiddle" && "origin-bottom"}`
                           : `                       
                              ${
                                origin === "topRight" &&
                                "origin-top-right right-0"
                              } 
                              ${origin === "topMiddle" && "origin-top"}`
                       }


                       `}
          >
            {options?.map((option) => (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={option.label}
                onClick={() => {
                  setIsOpened(false);
                  option.callback();
                }}
                className="flex items-center justify-start w-full h-optionsDropdownOptionHeight pl-1 py-1 gap-px
                           hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight transition-colors duration-0"
              >
                <span className="h-optionsDropdownOptionHeight w-optionsDropdownOptionHeight min-w-optionsDropdownOptionHeight p-1">
                  {option.icon}
                </span>
                <span className="flex-grow h-full pl-1 text-optionsDropdownOptionFont flex items-center justify-start">
                  {option.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
