import React, { useRef, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { YTree } from "yjs-orderedtree";
import { useDrag, useDrop } from "react-dnd";
import useYMap from "../../../hooks/useYMap";
import dataManagerSubdocs from "../../../lib/dataSubDoc";
import { libraryStore } from "../../../stores/libraryStore";
import { appStore } from "../../../stores/appStore";
import { AnimatePresence, motion } from "motion/react";

/**
 *
 * @param {{ytree: YTree, itemId: string}} param0
 * @returns
 */
const DirectoryItemNode = ({ ytree, itemId }) => {
  console.log("Directory item node rendered: ", itemId);

  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = libraryStore((state) => state.setItemId);

  const dndRef = useRef(null);

  // Get the node value map and determine its type.
  const itemMapRef = useRef(ytree.getNodeValueFromKey(itemId));

  console.log("Directory item node rendered: ", itemId, itemMapRef.current);

  const itemMapState = useYMap(itemMapRef.current);

  const [nodeChildrenState, setNodeChildrenState] = useState(
    ytree.getNodeChildrenFromKey(itemId)
  );

  // "areaSelected" determines the hover area: top, middle, or bottom.
  const [areaSelected, setAreaSelected] = useState("top");
  const [isSelfSelected, setIsSelfSelected] = useState(false);
  const [isAncestor, setIsAncestor] = useState(false);

  const [isOpened, setIsOpened] = useState(false);

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
    dataManagerSubdocs.createEmptySection(ytree, itemId);
    setIsOpened(true);
  }, [ytree, itemId]);

  const onCreatePaperClick = useCallback(() => {
    dataManagerSubdocs.createEmptyPaper(ytree, itemId);
    setIsOpened(true);
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

      if (draggedItem.id === itemId) {
        setIsSelfSelected(true);
      } else {
        setIsSelfSelected(false);
      }

      if (ytree.isNodeUnderOtherNode(itemId, draggedItem.id)) {
        setIsAncestor(true);
      } else {
        setIsAncestor(false);
      }

      if (isAncestor || isSelfSelected) return;

      // Get the parent of the current node.
      const parentId = ytree.getNodeParentFromKey(itemId);
      const parentChildren = ytree.getNodeChildrenFromKey(parentId);

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
    <div
      id="DirectoryItemNodeContainer"
      ref={dndRef}
      className={`
        bg-appBackground

        flex flex-col

        w-full h-fit
        
        ${isDragging ? "opacity-20" : ""}

        ${(() => {
          if (!isSelfSelected && !isAncestor && isOverCurrent) {
            if (areaSelected === "top")
              return "border-t border-b border-b-transparent border-t-blue-500";
            if (areaSelected === "bottom")
              return "border-b border-t border-t-transparent border-b-blue-500";
            if (areaSelected === "middle") return "bg-blue-500 bg-opacity-50";
          }
          return "border-y border-appBackground";
        })()}

   
          
          `}
    >
      <div
        id="DirectoryItemNodeHeader"
        className={`flex justify-between items-center  hover:bg-appLayoutHover bg-appBackground  pr-1 

          ${(() => {
            const type = itemMapRef.current.get("type");
            if (type === "paper")
              return "h-libraryDirectoryPaperNodeHeight text-libraryDirectoryPaperNodeFontSize";
            if (type === "section")
              return "h-libraryDirectorySectionNodeHeight text-libraryDirectorySectionNodeFontSize";
            if (type === "book")
              return "h-libraryDirectoryBookNodeHeight text-libraryDirectoryBookNodeFontSize";
            return "";
          })()}

          transition-colors
          duration-200

        `}
      >
        {itemMapRef.current.get("type") == "paper" && (
          <button
            className="flex-grow flex items-center justify-start h-full pl-5"
            onClick={() => {
              console.log("edit paper button");
              setItemId(itemId);
              setPanelOpened(false);
            }}
          >
            <span>{itemMapState.item_title}</span>
          </button>
        )}

        {(itemMapRef.current.get("type") === "section" ||
          itemMapRef.current.get("type") === "book") && (
          <>
            <button
              className="flex-grow flex items-center justify-start h-full pl-2"
              onClick={() => {
                setIsOpened(!isOpened);
              }}
            >
              <motion.span
                animate={{ rotate: isOpened ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className={`icon-[material-symbols-light--keyboard-arrow-right] ${(() => {
                  const type = itemMapRef.current.get("type");

                  if (type === "section")
                    return "h-libraryDirectorySectionNodeIconSize w-libraryDirectorySectionNodeIconSize";
                  if (type === "book")
                    return "h-libraryDirectoryBookNodeIconSize w-libraryDirectoryBookNodeIconSize";
                  return "";
                })()}`}
              ></motion.span>

              <span>{itemMapState.item_title}</span>
            </button>
            <button
              className={`hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex justify-center p-1 rounded-full transition-colors duration-100 items-center ${(() => {
                const type = itemMapRef.current.get("type");

                if (type === "section")
                  return "h-libraryDirectorySectionNodeIconSize w-libraryDirectorySectionNodeIconSize";
                if (type === "book")
                  return "h-libraryDirectoryBookNodeIconSize w-libraryDirectoryBookNodeIconSize";
                return "";
              })()}`}
              onClick={() => {
                console.log("edit section details button");
                setItemId(itemId);
                setPanelOpened(false);
              }}
            >
              <span className="icon-[mdi--edit-outline] h-full w-full transition-colors duration-100"></span>
            </button>
            <button
              className={`hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex justify-center p-1 rounded-full transition-colors duration-100 items-center ${(() => {
                const type = itemMapRef.current.get("type");

                if (type === "section")
                  return "h-libraryDirectorySectionNodeIconSize w-libraryDirectorySectionNodeIconSize";
                if (type === "book")
                  return "h-libraryDirectoryBookNodeIconSize w-libraryDirectoryBookNodeIconSize";
                return "";
              })()}`}
              onClick={() => {
                console.log("create section button");
                onCreateSectionClick();
              }}
            >
              <span className="icon-[mdi--folder-add-outline] h-full w-full transition-colors duration-100"></span>
            </button>

            <button
              className={`hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex justify-center p-1 rounded-full transition-colors duration-100 items-center ${(() => {
                const type = itemMapRef.current.get("type");

                if (type === "section")
                  return "h-libraryDirectorySectionNodeIconSize w-libraryDirectorySectionNodeIconSize";
                if (type === "book")
                  return "h-libraryDirectoryBookNodeIconSize w-libraryDirectoryBookNodeIconSize";
                return "";
              })()}`}
              onClick={() => {
                console.log("create paper button");
                onCreatePaperClick();
              }}
            >
              <span className="icon-[mdi--paper-add-outline] h-full w-full transition-colors duration-100"></span>
            </button>
          </>
        )}
      </div>
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
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
                id="DirectoryItemNodeBodyContainer"
                className={`w-full ${(() => {
                  const type = itemMapRef.current.get("type");
                  if (type === "paper") return "pl-5";
                  if (type === "section") return "pl-5";
                  if (type === "book") return "pl-5";
                  return "";
                })()}`}
              >
                <div
                  id="DirectoryItemNodeBody"
                  className="h-fit w-full grid grid-cols-1 border-l border-appLayoutBorder"
                >
                  {nodeChildrenState !== null &&
                    ytree
                      .sortChildrenByOrder(nodeChildrenState, itemId)
                      .map((childKey) => (
                        <div id="DirectoryItemNodeChild" key={childKey}>
                          <DirectoryItemNode ytree={ytree} itemId={childKey} />
                        </div>
                      ))}
                </div>
              </motion.div>
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

DirectoryItemNode.propTypes = {
  ytree: PropTypes.object.isRequired,
  itemId: PropTypes.string.isRequired,
};

export default DirectoryItemNode;
