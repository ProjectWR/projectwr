import { useState } from "react";
import PropTypes from "prop-types";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DropdownMenu } from "radix-ui";
import { StyledTooltip } from "../../LayoutComponents/StyledTooltip";
import { TYPE_CATEGORIES } from "./organizeConstants";

const OrganizeNode = ({
  item,
  config,
  onUpdateConfig,
  onRemove,
  index,
  section,
}) => {
  const [isRemoveHovered, setIsRemoveHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: "ORGANIZE_ITEM",
    item: { id: item.id, index, section, config },
    canDrag: () => config.type !== "title_page",
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: "ORGANIZE_ITEM",
    hover: (draggedItem) => {
      if (draggedItem.id === item.id) return;

      // Move item to this position
      onUpdateConfig(draggedItem.id, {
        section,
        order: index,
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleTypeChange = (newType) => {
    onUpdateConfig(item.id, { type: newType });
  };

  const currentType = TYPE_CATEGORIES[section].find(
    (t) => t.value === config.type,
  );

  // Filter available types based on whether the item is virtual
  const availableTypes = TYPE_CATEGORIES[section].filter((type) => {
    if (item.isVirtual) return type.isSystem;
    return type.isUser;
  });

  const isTitlePage = config.type === "title_page";

  return (
    <div
      ref={(node) => !isTitlePage && drag(drop(node))}
      className={`flex items-center w-full gap-1 h-fit text-libraryDirectoryBookNodeFontSize rounded ${isDragging ? "opacity-50" : ""} ${isOver ? "bg-appLayoutHover" : ""}`}
    >
      <div
        className={`flex items-center h-libraryDirectoryPaperNodeHeight py-1 px-2 rounded-md grow gap-2 hover:bg-appLayoutHover group ${isRemoveHovered ? "bg-appLayoutHover" : ""}`}
      >
        {/* Drag Handle */}
        {!isTitlePage ? (
          <span className="icon-[mdi--drag-vertical] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize text-appLayoutTextMuted cursor-move" />
        ) : (
          <div className="w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize" />
        )}

        <span
          className={`flex-1 truncate select-none ${item.isVirtual ? "text-appLayoutText font-medium" : "text-appLayoutText"}`}
        >
          {item.title}
        </span>
      </div>

      {/* Type Dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            onMouseOver={() => setIsRemoveHovered(true)}
            onMouseOut={() => setIsRemoveHovered(false)}
            className="px-2 py-0.5 rounded-md text-libraryDirectoryBookNodeFontSize text-nowrap overflow-x-hidden overflow-ellipsis bg-appLayoutBackground border border-appLayoutBorder hover:bg-appLayoutHover text-appLayoutTextMuted hover:text-appLayoutText disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={availableTypes.length <= 1}
          >
            {currentType?.label || "Select Type"}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className="contextMenuContent z-1100 min-w-[180px]"
          sideOffset={5}
          align="start"
        >
          {availableTypes.map((type) => (
            <DropdownMenu.Item
              key={type.value}
              className="contextMenuItem"
              onClick={() => handleTypeChange(type.value)}
            >
              {type.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <StyledTooltip label="Remove">
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 rounded-md w-libraryDirectoryPaperNodeHeight h-libraryDirectoryPaperNodeHeight hover:bg-appLayoutHover text-appLayoutTextMuted hover:text-appLayoutText flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed"
          onMouseOver={() => setIsRemoveHovered(true)}
          onMouseOut={() => setIsRemoveHovered(false)}
          disabled={config.type === "title_page"}
        >
          <span className="icon-[mdi--remove] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize" />
        </button>
      </StyledTooltip>
    </div>
  );
};

OrganizeNode.propTypes = {
  item: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  onUpdateConfig: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  section: PropTypes.string.isRequired,
};

const DropSection = ({ children, section, onUpdateConfig }) => {
  const [{ isOver }, drop] = useDrop({
    accept: "ORGANIZE_ITEM",
    drop: (draggedItem) => {
      // If we drop on the section itself (not on a specific node), move to end of section
      if (draggedItem.section !== section) {
        onUpdateConfig(draggedItem.id, {
          section,
          order: 9999, // Move to end
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div
      ref={drop}
      className={`flex w-full flex-col gap-1 min-h-[100px] transition-colors duration-100 ${isOver ? "bg-appLayoutHover/50" : ""}`}
    >
      {children}
    </div>
  );
};

DropSection.propTypes = {
  children: PropTypes.node,
  section: PropTypes.string.isRequired,
  onUpdateConfig: PropTypes.func.isRequired,
};

const OrganizeView = ({
  data,
  compileConfig,
  onUpdateConfig,
  onRemove,
  onAddVirtual,
}) => {
  // Group items by section
  const itemsBySection = {
    front: [],
    body: [],
    back: [],
  };

  const formatTitle = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Reconstruct list from compileConfig
  compileConfig.forEach((config) => {
    const binderItem = data.find((d) => d.id === config.nodeId);
    const item = binderItem || {
      id: config.nodeId,
      title: formatTitle(config.type),
      isVirtual: true,
    };
    itemsBySection[config.section].push({ item, config });
  });

  // Sort by order within each section
  Object.keys(itemsBySection).forEach((section) => {
    itemsBySection[section].sort((a, b) => a.config.order - b.config.order);
  });

  const renderSection = (section, title) => {
    const items = itemsBySection[section];

    return (
      <div className="w-full flex flex-col">
        <div className="w-full px-1 pt-1 flex flex-col items-start gap-1 border border-transparent rounded-md overflow-hidden">
          <div className="w-full flex justify-between items-center">
            <h3 className="w-fit px-2 flex justify-start items-center text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
              {title}
            </h3>

            {/* Header Actions for Front and Body */}
            {(section === "front" || section === "body") && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center justify-center w-fit h-fit py-px px-1 rounded-md hover:bg-appLayoutHover text-appLayoutTextMuted hover:text-appLayoutText">
                    <span className="icon-[mdi--plus] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  className="contextMenuContent z-1100 min-w-[150px]"
                  sideOffset={5}
                  align="end"
                >
                  {section === "front" && (
                    <DropdownMenu.Item
                      className="contextMenuItem"
                      onClick={() => onAddVirtual("table_of_contents", "front")}
                      disabled={compileConfig.some(
                        (c) => c.type === "table_of_contents",
                      )}
                    >
                      Table of Contents
                    </DropdownMenu.Item>
                  )}
                  {section === "body" && (
                    <DropdownMenu.Item
                      className="contextMenuItem"
                      onClick={() => onAddVirtual("part_divider", "body")}
                    >
                      Part Divider
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            )}
          </div>

          <div className="divider w-full px-1">
            <div className="w-full h-px bg-appLayoutBorder"></div>
          </div>
          <DropSection section={section} onUpdateConfig={onUpdateConfig}>
            {items.length === 0 ? (
              <div className="flex items-center justify-start px-3 py-1 rounded-md text-appLayoutTextMuted text-libraryDirectoryBookNodeFontSize select-none pointer-events-none italic opacity-50">
                Drop items here for {title.toLowerCase()}
              </div>
            ) : (
              items.map(({ item, config }, index) => (
                <OrganizeNode
                  key={item.id}
                  item={item}
                  config={config}
                  onUpdateConfig={onUpdateConfig}
                  onRemove={onRemove}
                  index={index}
                  section={section}
                />
              ))
            )}
          </DropSection>
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full flex flex-col lg:flex-row gap-4">
        {renderSection("front", "Front Matter")}
        {renderSection("body", "Body Matter")}
        {renderSection("back", "Back Matter")}
      </div>
    </DndProvider>
  );
};

OrganizeView.propTypes = {
  data: PropTypes.array.isRequired,
  compileConfig: PropTypes.array.isRequired,
  onUpdateConfig: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onAddVirtual: PropTypes.func.isRequired,
};

export default OrganizeView;
