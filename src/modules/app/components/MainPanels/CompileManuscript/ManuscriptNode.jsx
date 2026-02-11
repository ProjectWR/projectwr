import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import { motion, AnimatePresence } from "motion/react";

const ManuscriptNode = ({
  item,
  index,
  moveItem,
  removeItem,
  updateItem,
  onDrop,
  level = 0,
}) => {
  const ref = React.useRef(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const [{ handlerId }, drop] = useDrop({
    accept: ["MANUSCRIPT_ITEM", "BINDER_ITEM"],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(draggedItem, monitor) {
      if (!ref.current) {
        return;
      }

      if (draggedItem.type !== "MANUSCRIPT_ITEM") {
        return;
      }

      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      draggedItem.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "MANUSCRIPT_ITEM",
    item: () => {
      return { id: item.id, index, type: "MANUSCRIPT_ITEM" };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const handleExpandToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      ref={ref}
      className={`relative flex flex-col ${isDragging ? "opacity-30" : "opacity-100"}`}
      style={{ marginLeft: `${level * 16}px` }}
      data-handler-id={handlerId}
    >
      <div className="flex items-center gap-2 p-2 bg-appLayoutBackground border border-appLayoutBorder rounded hover:bg-appLayoutHover mb-1 group">
        {/* Drag Handle */}
        <div className="cursor-grab text-appLayoutTextMuted hover:text-appLayoutText">
          <span className="icon-[fluent--drag-24-regular] w-4 h-4" />
        </div>

        {/* Expand Toggle if has children */}
        {item.children && item.children.length > 0 ? (
          <button onClick={handleExpandToggle} className="p-1">
            <motion.span
              animate={{ rotate: isExpanded ? 90 : 0 }}
              className="icon-[formkit--right] w-4 h-4 text-appLayoutTextMuted"
            />
          </button>
        ) : (
          <div className="w-6" /> // spacer
        )}

        {/* Icon */}
        <span
          className={`icon-[fluent--document-24-regular] w-4 h-4 text-appLayoutTextMuted`}
        />

        <span className="flex-1 text-appLayoutText truncate select-none">
          {item.title}
        </span>

        {/* Actions */}
        <button
          onClick={() => removeItem(item.id)}
          className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-appLayoutInverseHover rounded"
        >
          <span className="icon-[fluent--delete-24-regular] w-4 h-4" />
        </button>
      </div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && item.children && item.children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col"
          >
            {item.children.map((child, idx) => (
              <ManuscriptNode
                key={child.id}
                item={child}
                index={idx}
                moveItem={moveItem}
                removeItem={removeItem}
                updateItem={updateItem}
                onDrop={onDrop}
                level={0} // Hierarchy handled by parent recursion in ManuscriptView usually,
                // but here we might need recursive component logic.
                // For simplicity, let's keep flat list in data for now or recurse?
                // User request showed tree structure.
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

ManuscriptNode.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  moveItem: PropTypes.func,
  removeItem: PropTypes.func,
  updateItem: PropTypes.func,
  onDrop: PropTypes.func,
  level: PropTypes.number,
};

export default ManuscriptNode;
