import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "motion/react";
import useYMap from "../../../hooks/useYMap";

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
  checkboxState,
  onCheckboxChange,
  isDisabled,
  depth = 0,
}) => {
  const itemMapRef = useRef(ytree.getNodeValueFromKey(itemId));
  const itemMapState = useYMap(itemMapRef.current);

  const [nodeChildren, setNodeChildren] = useState(
    ytree.getNodeChildrenFromKey(itemId)
  );

  const [isExpanded, setIsExpanded] = useState(false);

  const itemType = itemMapRef.current.get("type");
  const hasChildren = nodeChildren && nodeChildren.length > 0;
  const canExpand =
    (itemType === "section" || itemType === "book") && hasChildren;

  const disabled = isDisabled(itemId);
  const checked = checkboxState[itemId] || false;

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

  const handleCheckboxChange = (e) => {
    if (!disabled) {
      onCheckboxChange(itemId, e.target.checked);
    }
  };

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
    <div className="w-full">
      {/* Node Header */}
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded-md hover:bg-appLayoutHover transition-colors ${
          disabled ? "opacity-50" : ""
        }`}
        style={{
          paddingLeft: `${depth * 1.5 + 0.5}rem`,
        }}
      >
        {/* Expand/Collapse Button */}
        {canExpand ? (
          <button
            type="button"
            onClick={handleExpandToggle}
            className="w-4 h-4 flex items-center justify-center shrink-0"
          >
            <motion.span
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="icon-[formkit--right] w-3 h-3"
            />
          </button>
        ) : (
          <div className="w-4 h-4 flex-shrink-0" />
        )}

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleCheckboxChange}
          className={`w-4 h-4 shrink-0 rounded border-appLayoutBorder cursor-pointer ${
            disabled ? "cursor-not-allowed" : ""
          }`}
        />

        {/* Icon */}
        <span className={`${getIcon()} w-4 h-4 shrink-0`} />

        {/* Title */}
        <span
          className={`text-sm grow min-w-0 truncate ${
            disabled ? "text-appLayoutTextMuted" : "text-appLayoutText"
          }`}
        >
          {itemMapState.item_properties?.item_title || "Untitled"}
        </span>
      </div>

      {/* Children */}
      <AnimatePresence mode="wait">
        {isExpanded && canExpand && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="relative">
              {/* Vertical connecting line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-appLayoutBorder"
                style={{
                  left: `${depth * 1.5 + 0.5 + 0.5}rem`,
                }}
              />

              {/* Child nodes */}
              <div className="flex flex-col">
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
  checkboxState: PropTypes.object.isRequired,
  onCheckboxChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.func.isRequired,
  depth: PropTypes.number,
};

export default ExportTreeNode;
