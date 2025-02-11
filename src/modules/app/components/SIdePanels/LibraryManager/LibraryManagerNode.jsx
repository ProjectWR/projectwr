import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import {
  getNextOrderIndex,
  getPreviousOrderIndex,
  insertBetween,
} from "../../../utils/orderUtil";
import useYMap from "../../../hooks/useYMap";
import dataManagerSubdocs, {
  getArrayFromYDocMap,
} from "../../../lib/dataSubDoc";
import { libraryStore } from "../../../stores/libraryStore";
import { appStore } from "../../../stores/appStore";

/**
 *
 * @param {{libraryId: string, className: string}} param0
 * @returns
 */
const LibraryManagerNode = ({ libraryId, className }) => {
  const setLibraryId = libraryStore((state) => state.setLibraryId);
  const setItemId = libraryStore((state) => state.setItemId);

  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const libraryPropsMapRef = useRef(
    dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
  );

  console.log("library node rendered: ", libraryId, libraryPropsMapRef.current);
  const ref = useRef(null);

  const libraryPropsMapState = useYMap(libraryPropsMapRef.current);

  const [isTopSelected, setIsTopSelected] = useState(false);
  const [isSelfSelected, setIsSelfSelected] = useState(false);

  const [isOpened, setIsOpened] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "LIBRARY",
    item: {
      id: libraryId,
      type: "library",
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOverCurrent }, drop] = useDrop({
    accept: "LIBRARY",
    hover: (draggedItem, monitor) => {
      if (!ref.current) {
        return;
      }

      if (draggedItem.id === libraryId) {
        setIsSelfSelected(true);
        return;
      }

      setIsSelfSelected(false);

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

      console.log("ITEM DROPPED: ", draggedItem);

      if (draggedItem.id === libraryId) {
        setIsSelfSelected(true);
        return;
      }

      setIsSelfSelected(false);

      if (draggedItem.type !== "library") return;

      console.log("SETTING POSITION: ");
      if (isTopSelected) {
        const previousOrderIndex = getPreviousOrderIndex(
          libraryId,
          getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap)
        );

        const orderIndex = insertBetween(
          previousOrderIndex,
          libraryPropsMapRef.current.get("order_index")
        );

        dataManagerSubdocs
          .getLibrary(draggedItem.id)
          .getMap("library_props")
          .set("order_index", orderIndex);
      }

      if (!isTopSelected) {
        const nextOrderIndex = getNextOrderIndex(
          libraryId,
          getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap)
        );

        const orderIndex = insertBetween(
          libraryPropsMapRef.current.get("order_index"),
          nextOrderIndex
        );

        dataManagerSubdocs
          .getLibrary(draggedItem.id)
          .getMap("library_props")
          .set("order_index", orderIndex);
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
        library-${libraryId}  

        transition-all ease-in-out duration-200

        ${isDragging ? "opacity-20" : ""} 
        
        ${(() => {
          if (!isSelfSelected && isOverCurrent) {
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
      <div className="w-full h-full flex flex-row items-center justify-between hover:bg-appLayoutHover transition-colors duration-200">
        <button
          className={
            "flex-grow h-full flex justify-start items-center pl-4 text-libraryManagerNodeText hover:text-appLayoutHighlight hover:bg-appLayoutHover transition-colors duration-200"
          }
          onClick={() => {
            console.log("Library Entry when clicked: ", libraryPropsMapState);
            setLibraryId(libraryId);
            setItemId("unselected");
            setPanelOpened(true);
          }}
        >
          <div className="flex items-center gap-2">
            <span className="icon-[arcticons--khatabook] h-libraryManagerNodeIconSize w-libraryManagerNodeIconSize transition-colors duration-100"></span>
            <p className="transition-colors duration-100">
              {libraryPropsMapState.library_name}
            </p>
          </div>
        </button>
        <button
          className="h-libraryManagerNodeEditButtonWidth w-libraryManagerNodeEditButtonWidth px-2 rounded-full m-2 hover:text-appLayoutHighlight hover:bg-appLayoutInverseHover transition-colors duration-200"
          onClick={() => {
            setLibraryId(libraryId);
            setItemId("unselected");
            setPanelOpened(false);
          }}
        >
          <span className="icon-[mdi--edit-outline] h-full w-full transition-colors duration-100"></span>
        </button>
      </div>
    </div>
  );
};

LibraryManagerNode.propTypes = {
  libraryId: PropTypes.string.isRequired,
  libraryPropsMap: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default LibraryManagerNode;
