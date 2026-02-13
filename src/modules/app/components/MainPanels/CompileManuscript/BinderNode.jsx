import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "motion/react";
import useYMap from "../../../hooks/useYMap";
import dataManagerSubdocs from "../../../lib/dataSubDoc";
import { DropdownMenu } from "radix-ui";
import { v4 as uuidv4 } from "uuid";
import { StyledTooltip } from "../../LayoutComponents/StyledTooltip";

const BinderNode = ({ ytree, itemId, libraryId, depth = 0, onAdd }) => {
  // Check item type early to filter out notes before any hooks
  const itemType =
    itemId === "root"
      ? "library"
      : ytree.getNodeValueFromKey(itemId).get("type");

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

  const [addHovered, setAddHovered] = useState(false);

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

  const createNodeObject = (id, type, title) => {
    return {
      id: uuidv4(),
      sourceId: id,
      type: type || null,
      title: title || null,
      section: "bodyMatter",
      category: "chapter"
    };
  };

  const handleAddToManuscript = (mode) => {
    const title = itemMapState.item_properties?.item_title || null;

    if (mode === "item") {
      // Add as single item (no children)
      const item = createNodeObject(itemId, itemType, title);
      onAdd(item);
    } else if (mode === "flat") {
      // Add only direct paper children as flat list (no nesting, no notes/sections)
      const childrenIds = ytree.getNodeChildrenFromKey(itemId);
      const sortedChildIds = ytree.sortChildrenByOrder(childrenIds, itemId);

      const flatItems = sortedChildIds
        .map((childId) => {
          const childMap = ytree.getNodeValueFromKey(childId);
          const childType = childMap.get("type");
          const childTitle =
            childMap.get("item_properties")?.item_title || "Untitled";

          // Only include papers (chapters), skip notes and sections
          if (childType === "paper") {
            return createNodeObject(childId, childType, childTitle); 
          }
          return null;
        })
        .filter((item) => item !== null); // Remove null entries

      onAdd(flatItems);
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

  // Don't render notes - they're not part of manuscript compilation
  if (itemType === "note") {
    return null;
  }

  return (
    <div className="w-full flex flex-col h-fit">
      <div
        className={`w-full flex items-center gap-1 h-libraryDirectoryPaperNodeHeight group`}
      >
        {/* Node Header */}
        <div
          className={`h-full grow flex items-center gap-2 py-1 px-2 rounded-md hover:bg-appLayoutHover transition-colors ${addHovered ? "bg-appLayoutHover" : ""}`}
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
            title={itemMapState.item_properties?.item_title || "Untitled"}
          >
            {itemMapState.item_properties?.item_title || "Untitled"}
          </span>
        </div>

        <StyledTooltip label={"add"}>
          {/* Add Button / Dropdown - Always visible, outside main button */}
          <div
            className="flex items-center shrink-0"
            onMouseOver={() => setAddHovered(true)}
            onMouseOut={() => setAddHovered(false)}
          >
            {(itemType === "section" ||
              itemType === "book" ||
              itemType === "library") &&
            itemId !== "root" ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="p-1 rounded-md w-libraryDirectoryPaperNodeHeight h-libraryDirectoryPaperNodeHeight hover:bg-appLayoutHover text-appLayoutTextMuted hover:text-appLayoutText flex items-center justify-center outline-none">
                    <span className="icon-[ep--right] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  className="contextMenuContent z-[1100] min-w-[200px]"
                  sideOffset={5}
                  align="start"
                >
                  <DropdownMenu.Item
                    className="contextMenuItem"
                    onClick={() => handleAddToManuscript("item")}
                  >
                    Add section as single file
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="contextMenuItem"
                    onClick={() => handleAddToManuscript("flat")}
                  >
                    Add section as list of chapters
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : itemId !== "root" ? (
              <button
                onClick={() => handleAddToManuscript("item")}
                className="p-1 rounded-md w-libraryDirectoryPaperNodeHeight h-libraryDirectoryPaperNodeHeight hover:bg-appLayoutHover text-appLayoutTextMuted hover:text-appLayoutText flex items-center justify-center"
                title="Add to Manuscript"
              >
                <span className="icon-[ep--right] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize" />
              </button>
            ) : null}
          </div>
        </StyledTooltip>
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
                key={`compile_manuscript-${childId}`}
                ytree={ytree}
                itemId={childId}
                libraryId={libraryId}
                depth={depth + 1}
                onAdd={onAdd}
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
  onAdd: PropTypes.func.isRequired,
};

export default BinderNode;
