import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "motion/react";
import useYMap from "../../../hooks/useYMap";
import Checkbox from "../Checkbox";
import dataManagerSubdocs from "../../../lib/dataSubDoc";

/**
 * ExportTreeNode - Recursive tree node component for export selection
 * @param {Object} props
 * @param {Object} props.ytree - YTree instance
 * @param {string} props.itemId - Item ID for this node
 * @param {Object} props.checkboxState - Checkbox state object { [itemId]: boolean }
 * @param {Function} props.onCheckboxChange - Callback when checkbox is toggled
 * @param {Function} props.isDisabled - Function to check if this node should be disabled
 * @param {number} props.depth - Current depth in the tree (for indentation)
 */
const ExportTreeNode = ({
  ytree,
  itemId,
  libraryId,
  checkboxState,
  onCheckboxChange,
  isDisabled,
  depth = 0,
}) => {
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

  const disabled = isDisabled(itemId);
  const checked = checkboxState[itemId] || false;

  // Update children when ytree changes
  useEffect(() => {
    const updateNodeChildren = () => {
      try {
        setNodeChildren(ytree.getNodeChildrenFromKey(itemId));
      } catch (error) {
        console.warn("Error updating node children for itemId:", itemId, error);
      }
    };

    ytree.observe(updateNodeChildren);

    return () => {
      ytree.unobserve(updateNodeChildren);
    };
  }, [itemId, ytree]);

  const handleExpandToggle = () => {
    if (canExpand) {
      setIsExpanded(!isExpanded);
    }
  };

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
      <div className="w-full flex items-center h-libraryDirectoryPaperNodeHeight">
        {/* Node Header */}
        <div
          className={`h-full grow flex items-center gap-2 py-1 px-2 rounded-md hover:bg-appLayoutHover transition-colors ${
            disabled ? "opacity-50" : ""
          }`}
        >
          {/* Expand/Collapse Button */}
          {canExpand && (
            <button
              type="button"
              onClick={handleExpandToggle}
              className="h-libraryDirectorySectionNodeIconSize w-libraryDirectorySectionNodeIconSize min-w-libraryDirectorySectionNodeIconSize flex items-center justify-center shrink-0"
            >
              <motion.span
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="icon-[formkit--right] w-full h-full"
              />
            </button>
          )}

          {/* Checkbox */}
          <Checkbox
            checked={checked}
            disabled={disabled}
            onCheckedChange={(val) => onCheckboxChange(itemId, val)}
            className="w-libraryDirectoryPaperNodeIconSize h-libraryDirectoryPaperNodeIconSize cursor-pointer"
          />

          {/* Icon */}
          <span
            className={`${getIcon()} w-libraryDirectoryPaperNodeIconSize h-libraryDirectoryPaperNodeIconSize shrink-0`}
          />

          {/* Title */}
          <span
            className={`text-libraryDirectoryPaperNodeFontSize grow min-w-0 truncate ${
              disabled ? "text-appLayoutTextMuted" : "text-appLayoutText"
            }`}
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
            className="overflow-hidden px-2 w-full h-fit flex"
          >
            {/* Vertical connecting line */}

            <div className="w-libraryDirectoryBookNodeIconSize min-w-libraryDirectoryBookNodeIconSize flex flex-col items-center justify-center ">
              <div className="w-px min-w-px h-full grow bg-appLayoutBorder"></div>
            </div>

            {/* Child nodes */}
            <div className="w-full h-fit flex flex-col">
              {ytree
                .sortChildrenByOrder(nodeChildren, itemId)
                .map((childId) => (
                  <ExportTreeNode
                    key={childId}
                    ytree={ytree}
                    itemId={childId}
                    checkboxState={checkboxState}
                    onCheckboxChange={onCheckboxChange}
                    isDisabled={isDisabled}
                    depth={depth + 1}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

ExportTreeNode.propTypes = {
  ytree: PropTypes.object.isRequired,
  itemId: PropTypes.string.isRequired,
  libraryId: PropTypes.string,
  checkboxState: PropTypes.object.isRequired,
  onCheckboxChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.func.isRequired,
  depth: PropTypes.number,
};

export default ExportTreeNode;
