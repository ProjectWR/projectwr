import { useCallback } from "react";
import PropTypes from "prop-types";
import { useDrop } from "react-dnd";
import { v4 as uuidv4 } from "uuid";
import ManuscriptNode from "./ManuscriptNode";

const ManuscriptView = ({ data, onUpdate }) => {
  // Helper to create new node from binder item
  const createNode = (binderItem) => {
    return {
      id: uuidv4(),
      sourceId: binderItem.id,
      type: binderItem.type || "document",
      title: binderItem.title || "Untitled",
      children: [],
      properties: {
        level: 0,
        include: true,
        pageBreak: "none",
      },
    };
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "BINDER_ITEM",
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      // Add to root
      const newNode = createNode(item);
      onUpdate([...data, newNode]);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const removeItem = useCallback(
    (id) => {
      // Recursive remove
      const removeRecursive = (items) => {
        return items
          .filter((item) => item.id !== id)
          .map((item) => ({
            ...item,
            children: item.children ? removeRecursive(item.children) : [],
          }));
      };
      onUpdate(removeRecursive(data));
    },
    [data, onUpdate],
  );

  const moveItem = useCallback(
    (dragIndex, hoverIndex) => {
      const dragItem = data[dragIndex];
      const newData = [...data];
      newData.splice(dragIndex, 1);
      newData.splice(hoverIndex, 0, dragItem);
      onUpdate(newData);
    },
    [data, onUpdate],
  );

  return (
    <div
      ref={drop}
      className={`w-full h-full min-h-[200px] flex flex-col gap-2 ${isOver ? "bg-appLayoutHighlight/10" : ""}`}
    >
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-appLayoutTextMuted select-none pointer-events-none">
          Drag items here from the Binder to build your manuscript
        </div>
      ) : (
        <div className="flex flex-col gap-1 pb-20">
          {data.map((item, index) => (
            <ManuscriptNode
              key={item.id}
              item={item}
              index={index}
              removeItem={removeItem}
              moveItem={moveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManuscriptView;

ManuscriptView.propTypes = {
  data: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
