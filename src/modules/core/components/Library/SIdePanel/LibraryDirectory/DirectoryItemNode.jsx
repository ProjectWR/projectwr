import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import DirectorySectionNode from "./DirectorySectionNode";
import DirectoryPaperNode from "./DirectoryPaperNode";
import {
  getNextOrderIndex,
  getPreviousOrderIndex,
} from "../../../../utils/orderUtil";
import dataManager from "../../../../lib/data";
import DirectoryBookNode from "./DirectoryBookNode";

const DirectoryItemNode = ({ itemEntryReference, className }) => {
  console.log("item node rendered");
  const ref = useRef(null);

  const parentItemMap = itemEntryReference.parent.toJSON();

  const [isTopSelected, setIsTopSelected] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ITEM",
    item: {
      id: itemEntryReference.get("item_id"),
      type: itemEntryReference.get("type"),
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{  isOverCurrent }, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem, monitor) => {
      if (!ref.current) {
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

      if (hoverClientY < hoverMiddleY) {
        setIsTopSelected(true);
      } else {
        setIsTopSelected(false);
      }
    },
    drop: (draggedItem, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }

      if (parentItemMap[draggedItem.id]) {
        if (isTopSelected) {
          const previousOrderIndex = getPreviousOrderIndex(
            itemEntryReference.get("item_id"),
            Object.entries(parentItemMap)
          );

          dataManager.setOrderOfItemEntry(
            draggedItem.id,
            itemEntryReference.parent.parent,
            previousOrderIndex,
            itemEntryReference.get("order_index")
          );
        }

        if (!isTopSelected) {
          const nextOrderIndex = getNextOrderIndex(
            itemEntryReference.get("item_id"),
            Object.entries(parentItemMap)
          );

          dataManager.setOrderOfItemEntry(
            draggedItem.id,
            itemEntryReference.parent.parent,
            itemEntryReference.get("order_index"),
            nextOrderIndex
          );
        }
      }

      if (!parentItemMap[draggedItem.id]) {
        console.log("not in parent item map");
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`
      
        item-${itemEntryReference.get("item_id")}  

        transition-all ease-in-out duration-200

        ${isDragging ? "opacity-20" : ""} 
      
        ${(() => {
          if (isOverCurrent) {
            return isTopSelected
              ? "border-t border-b border-b-transparent border-t-blue-500"
              : "border-b border-t border-t-transparent border-b-blue-500";
          } else {
            return "border-y border-black border-opacity-0";
          }
        })()}

        ${className}
      `}
    >
      {itemEntryReference.get("type") === "book" && (
        <DirectoryBookNode
          bookEntryReference={itemEntryReference}
          className={className}
        />
      )}

      {itemEntryReference.get("type") === "section" && (
        <DirectorySectionNode
          sectionEntryReference={itemEntryReference}
          className={className}
        />
      )}

      {itemEntryReference.get("type") === "paper" && (
        <DirectoryPaperNode
          paperEntryReference={itemEntryReference}
          className={className}
        />
      )}
    </div>
  );
};

DirectoryItemNode.propTypes = {
  itemEntryReference: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default React.memo(DirectoryItemNode, (prev, next) => {
  return (
    prev.itemEntryReference.get("item_id") ===
    next.itemEntryReference.get("item_id")
  );
});
