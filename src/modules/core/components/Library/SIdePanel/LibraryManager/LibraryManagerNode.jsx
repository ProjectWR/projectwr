import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import {
  getNextOrderIndex,
  getPreviousOrderIndex,
} from "../../../../utils/orderUtil";
import dataManager from "../../../../lib/data";
import WritingAppButton from "../../../../../design-system/WritingAppButton";
import useYMap from "../../../../hooks/useYMap";
import { pageStore } from "../../../../stores/pageStore";

const LibraryManagerNode = ({ libraryEntryReference, className }) => {
  console.log("library node rendered");
  const ref = useRef(null);

  const setContentPanel = pageStore((state) => state.setContentPanel);
  const setActiveLibraryItemEntryReference = pageStore(
    (state) => state.setActiveLibraryItemEntryReference
  );

  const setSecondarySidePanel = pageStore(
    (state) => state.setSecondarySidePanel
  );
  const setActiveLibraryEntryReference = pageStore(
    (state) => state.setActiveLibraryEntryReference
  );

  const libraryEntryState = useYMap(libraryEntryReference);

  const parentItemMap = libraryEntryReference.parent.toJSON();

  const [isTopSelected, setIsTopSelected] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ITEM",
    item: {
      id: libraryEntryReference.get("library_id"),
      type: libraryEntryReference.get("type"),
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOverCurrent }, drop] = useDrop({
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

      console.log("ITEM DROPPED: ");

      if (parentItemMap[draggedItem.id]) {
        console.log("SETTING POSITION: ");
        if (isTopSelected) {
          const previousOrderIndex = getPreviousOrderIndex(
            libraryEntryReference.get("library_id"),
            Object.entries(parentItemMap)
          );

          dataManager.setOrderOfLibraryEntry(
            draggedItem.id,
            libraryEntryReference.parent,
            previousOrderIndex,
            libraryEntryReference.get("order_index")
          );
        }

        if (!isTopSelected) {
          const nextOrderIndex = getNextOrderIndex(
            libraryEntryReference.get("library_id"),
            Object.entries(parentItemMap)
          );

          dataManager.setOrderOfLibraryEntry(
            draggedItem.id,
            libraryEntryReference.parent,
            libraryEntryReference.get("order_index"),
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
        w-full h-full
        library-${libraryEntryReference.get("library_id")}  

        transition-all ease-in-out duration-200

        ${isDragging ? "opacity-20" : ""} 
        
        ${(() => {
          if (isOverCurrent) {
            return isTopSelected
              ? "border-t border-b border-b-transparent border-t-neutral-200"
              : "border-b border-t border-t-transparent border-b-neutral-200";
          } else {
            return "border-y border-black border-opacity-0";
          }
        })()}

        ${className}
      `}
    >
      <WritingAppButton
        buttonContent={
          <div className="flex items-center gap-2">
            <span
              className="icon-[arcticons--khatabook]"
              style={{
                width: "32px",
                height: "32px",
              }}
            ></span>
            <p>{libraryEntryState.library_name}</p>
          </div>
        }
        className={
          "w-full h-full flex justify-start px-4 items-center text-xl  hover:bg-shadow-partial"
        }
        onClick={() => {
          console.log("Library Entry when clicked: ", libraryEntryReference);

          setContentPanel("createLibrary");
          setActiveLibraryItemEntryReference(libraryEntryReference);
          setSecondarySidePanel("library");
          setActiveLibraryEntryReference(libraryEntryReference);
        }}
      />
    </div>
  );
};

LibraryManagerNode.propTypes = {
  libraryEntryReference: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default React.memo(LibraryManagerNode, (prev, next) => {
  return (
    prev.libraryEntryReference.get("library_id") ===
    next.libraryEntryReference.get("library_id")
  );
});
