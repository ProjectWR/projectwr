import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "motion/react";
import useYMap from "../../../hooks/useYMap";
import dataManagerSubdocs from "../../../lib/dataSubDoc";
import { useDrag } from "react-dnd";

const BinderNode = ({ ytree, itemId, libraryId, depth = 0 }) => {
  const itemMapRef = useRef(
    itemId === "root"
      ? dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
      : ytree.getNodeValueFromKey(itemId),
  );
  const itemMapState = useYMap(itemMapRef.current);

  const [nodeChildren, setNodeChildren] = useState(
    ytree.getNodeChildrenFromKey(itemId),
  );

  const [isExpanded, setIsExpanded] = useState(false);

  const itemType =
    itemId === "root" ? "library" : itemMapRef.current.get("type");
  const hasChildren = nodeChildren && nodeChildren.length > 0;
  const canExpand =
    (itemType === "section" || itemType === "book" || itemType === "library") &&
    hasChildren;

  // Update children when ytree changes
  useEffect(() => {
    const updateNodeChildren = () => {
      setNodeChildren(ytree.getNodeChildrenFromKey(itemId));
    };

    ytree.observe(updateNodeChildren);

    return () => {
      ytree.unobserve(updateNodeChildren);
    };
  }, [itemId, ytree]);

  const handleExpandToggle = (e) => {
    e.stopPropagation();
    if (canExpand) {
      setIsExpanded(!isExpanded);
    }
  };

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "BINDER_ITEM",
      item: {
        id: itemId,
        type: itemType,
        title: itemMapState.item_properties?.item_title || "Untitled",
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: itemId !== "root",
    }),
    [itemId, itemType, itemMapState],
  );

  // Get appropriate icon for item type
  const getIcon = () => {
    switch (itemType) {
      case "book":
        return "icon-[fluent--book-24-regular]";
      case "section":
        return "icon-[fluent--folder-24-regular]";
      case "paper":
        return "icon-[fluent--document-one-page-24-regular]";
      case "note":
        return "icon-[fluent--square-20-regular]";
      default:
        return "icon-[fluent--document-24-regular]";
    }
  };

  return (
    <div className="w-full flex flex-col h-fit">
      <div
        ref={drag}
        className={`w-full flex items-center h-libraryDirectoryPaperNodeHeight ${isDragging ? "opacity-50" : "opacity-100"} cursor-grab active:cursor-grabbing`}
      >
        {/* Node Header */}
        <div
          className={`h-full grow flex items-center gap-2 py-1 px-2 rounded-md hover:bg-appLayoutHover transition-colors`}
        >
          {/* Expand/Collapse Button */}
          {canExpand ? (
            <button
              type="button"
              onClick={handleExpandToggle}
              className="h-libraryDirectorySectionNodeIconSize w-libraryDirectorySectionNodeIconSize min-w-libraryDirectorySectionNodeIconSize flex items-center justify-center shrink-0"
            >
              <motion.span
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="icon-[formkit--right] w-full h-full text-appLayoutTextMuted"
              />
            </button>
          ) : (
            <div className="h-libraryDirectorySectionNodeIconSize w-libraryDirectorySectionNodeIconSize min-w-libraryDirectorySectionNodeIconSize" />
          )}

          {/* Icon */}
          <span
            className={`${getIcon()} w-libraryDirectoryPaperNodeIconSize h-libraryDirectoryPaperNodeIconSize shrink-0 text-appLayoutTextMuted`}
          />

          {/* Title */}
          <span
            className={`text-libraryDirectoryPaperNodeFontSize grow min-w-0 truncate text-appLayoutText select-none`}
          >
            {itemMapState.item_properties?.item_title || "Untitled"}
          </span>
        </div>
      </div>

      {/* Children */}
      <AnimatePresence mode="wait">
        {isExpanded && canExpand && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-4 w-full h-fit flex flex-col"
          >
            {ytree.sortChildrenByOrder(nodeChildren, itemId).map((childId) => (
              <BinderNode
                key={childId}
                ytree={ytree}
                itemId={childId}
                libraryId={libraryId}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

BinderNode.propTypes = {
  ytree: PropTypes.object.isRequired,
  itemId: PropTypes.string.isRequired,
  libraryId: PropTypes.string,
  depth: PropTypes.number,
};

export default BinderNode;
