import { useState } from "react";
import PropTypes from "prop-types";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DropdownMenu } from "radix-ui";
import { StyledTooltip } from "../../LayoutComponents/StyledTooltip";
import { TYPE_CATEGORIES } from "./organizeConstants";
import { useCallback } from "react";
import { useRef } from "react";

const OrganizeNode = ({
  item,
  section,
  changeItemCategory,
  moveBeforeItem,
  moveAfterItem,
}) => {
  const [isRemoveHovered, setIsRemoveHovered] = useState(false);

  const dndRef = useRef();

  const [areaSelected, setAreaSelected] = useState("top");

  const [{ isDragging }, drag] = useDrag({
    type: "ORGANIZE_ITEM",
    item: item,
    canDrag: () => item != null,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, isOverCurrent }, drop] = useDrop({
    accept: "ORGANIZE_ITEM",
    hover: (draggedItem, monitor) => {
      if (draggedItem.id === item.id) return;

      const hoverClientOffset = monitor.getClientOffset();
      if (!hoverClientOffset) return;

      const hoverBoundingRect =
        monitor.getItemType() === "ORGANIZE_ITEM"
          ? dndRef.current?.getBoundingClientRect()
          : null;

      if (!hoverBoundingRect) return;

      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = hoverClientOffset.y - hoverBoundingRect.top;

      if (hoverClientY > hoverMiddleY) {
        setAreaSelected("bottom");
      } else {
        setAreaSelected("top");
      }
    },
    drop: (draggedItem) => {
      if (draggedItem.id === item.id) return;

      if (areaSelected === "top") {
        moveBeforeItem(item.id, draggedItem.id);
      } else {
        moveAfterItem(item.id, draggedItem.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  drag(drop(dndRef));

  return (
    <div
      ref={dndRef}
      className={`flex items-center w-full gap-1 h-fit text-libraryDirectoryBookNodeFontSize rounded ${isDragging ? "opacity-50" : ""} ${isOver ? "bg-appLayoutHover" : ""}
      
      ${isOverCurrent && areaSelected === "top" ? "border-t border-appLayoutBorder" : ""}
      ${isOverCurrent && areaSelected === "bottom" ? "border-b border-appLayoutBorder" : ""}
      `}
    >
      <div
        className={`flex items-center h-libraryDirectoryPaperNodeHeight py-1 px-2 rounded-md grow gap-2 hover:bg-appLayoutHover group ${isRemoveHovered ? "bg-appLayoutHover" : ""}`}
      >
        <span className="icon-[mdi--drag-vertical] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize text-appLayoutTextMuted cursor-move" />

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
          >
            {TYPE_CATEGORIES[section][item.category]?.label || "Select Type"}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className="contextMenuContent z-1100"
          sideOffset={5}
          align="start"
        >
          {Object.values(TYPE_CATEGORIES[section]).map((category) => (
            <DropdownMenu.Item
              key={category.value}
              className="contextMenuItem"
              onClick={() => changeItemCategory(item.id, category.value)}
            >
              {category.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

const DropSection = ({ children, section, manuscriptData, handleSave }) => {
  console.log("Rendering Drop Section: ", section);

  const [{ isOver }, drop] = useDrop({
    accept: "ORGANIZE_ITEM",
    drop: (draggedItem) => {
      // If we drop on the section itself (not on a specific node), move to end of section
      if (draggedItem.section !== section) {
        // Find indices
        const draggedIndex = manuscriptData.findIndex(
          (item) => item.id === draggedItem.id,
        );

        if (draggedIndex === -1) return;

        const updatedManuscriptData = [...manuscriptData];

        // Remove dragged item
        const [itemToMove] = updatedManuscriptData.splice(draggedIndex, 1);

        // Update section
        itemToMove.section = section;

        // Find last index of this section to insert after
        let insertIndex = updatedManuscriptData.length;
        for (let i = updatedManuscriptData.length - 1; i >= 0; i--) {
          if (updatedManuscriptData[i].section === section) {
            insertIndex = i + 1;
            break;
          }
        }

        // Insert at end of section
        updatedManuscriptData.splice(insertIndex, 0, itemToMove);

        handleSave(updatedManuscriptData);
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

const OrganizeView = ({ manuscriptData, handleSave }) => {
  const changeItemCategory = useCallback(
    (id, newCategory) => {
      const updatedManuscriptData = manuscriptData.map((item) => {
        if (item.id === id) {
          return { ...item, category: newCategory };
        }
        return item;
      });
      handleSave(updatedManuscriptData);
    },
    [manuscriptData, handleSave],
  );

  const moveBeforeItem = useCallback(
    (targetId, draggedId) => {
      // Find indices
      const draggedIndex = manuscriptData.findIndex(
        (item) => item.id === draggedId,
      );
      const targetIndex = manuscriptData.findIndex(
        (item) => item.id === targetId,
      );

      if (draggedIndex === -1 || targetIndex === -1) return;

      const updatedManuscriptData = [...manuscriptData];

      // Remove dragged item
      const [draggedItem] = updatedManuscriptData.splice(draggedIndex, 1);

      // Update section to match target
      const targetItem = manuscriptData[targetIndex];
      draggedItem.section = targetItem.section;

      // Calculate new target index (since removal might have shifted it)
      const newTargetIndex = updatedManuscriptData.findIndex(
        (item) => item.id === targetId,
      );

      // Insert before target
      updatedManuscriptData.splice(newTargetIndex, 0, draggedItem);

      handleSave(updatedManuscriptData);
    },
    [manuscriptData, handleSave],
  );

  const moveAfterItem = useCallback(
    (targetId, draggedId) => {
      // Find indices
      const draggedIndex = manuscriptData.findIndex(
        (item) => item.id === draggedId,
      );
      const targetIndex = manuscriptData.findIndex(
        (item) => item.id === targetId,
      );

      if (draggedIndex === -1 || targetIndex === -1) return;

      const updatedManuscriptData = [...manuscriptData];

      // Remove dragged item
      const [draggedItem] = updatedManuscriptData.splice(draggedIndex, 1);

      // Update section to match target
      const targetItem = manuscriptData[targetIndex];
      draggedItem.section = targetItem.section;

      // Calculate new target index (since removal might have shifted it)
      const newTargetIndex = updatedManuscriptData.findIndex(
        (item) => item.id === targetId,
      );

      // Insert after target
      updatedManuscriptData.splice(newTargetIndex + 1, 0, draggedItem);

      handleSave(updatedManuscriptData);
    },
    [manuscriptData, handleSave],
  );

  const renderSection = (section, title) => {
    const items = manuscriptData.filter((item) => item.section === section);

    return (
      <div className="w-full flex flex-col">
        <div className="w-full px-1 pt-1 flex flex-col items-start gap-1 border border-transparent rounded-md overflow-hidden">
          <div className="w-full flex justify-between items-center">
            <h3 className="w-fit px-2 flex justify-start items-center text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
              {title}
            </h3>
          </div>

          <div className="divider w-full px-1">
            <div className="w-full h-px bg-appLayoutBorder"></div>
          </div>

          <DropSection
            section={section}
            manuscriptData={manuscriptData}
            handleSave={handleSave}
          >
            {items.length === 0 ? (
              <div className="flex items-center justify-start px-3 py-1 rounded-md text-appLayoutTextMuted text-libraryDirectoryBookNodeFontSize select-none pointer-events-none italic opacity-50">
                Drop items here for {title.toLowerCase()}
              </div>
            ) : (
              items.map((item) => (
                <OrganizeNode
                  key={item.id}
                  item={item}
                  section={section}
                  changeItemCategory={changeItemCategory}
                  moveAfterItem={moveAfterItem}
                  moveBeforeItem={moveBeforeItem}
                />
              ))
            )}
          </DropSection>
        </div>
      </div>
    );
  };

  return (
    <div className="organizeSectionContainer w-full flex flex-col lg:flex-row gap-4">
      {renderSection("frontMatter", "Front Matter")}
      {renderSection("bodyMatter", "Body Matter")}
      {renderSection("backMatter", "Back Matter")}
    </div>
  );
};

OrganizeView.propTypes = {
  manuscriptData: PropTypes.array.isRequired,
  handleSave: PropTypes.func.isRequired,
};

export default OrganizeView;
