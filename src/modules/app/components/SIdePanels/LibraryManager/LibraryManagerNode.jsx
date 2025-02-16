import React, { useEffect, useRef, useState } from "react";
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
import { AnimatePresence, motion } from "motion/react";
import { max, min } from "lib0/math";

/**
 *
 * @param {{libraryId: string, className: string}} param0
 * @returns
 */
const LibraryManagerNode = ({ libraryId, className }) => {
  console.log("library node rendered: ", libraryId);

  const setLibraryId = libraryStore((state) => state.setLibraryId);
  const setItemId = libraryStore((state) => state.setItemId);

  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const libraryPropsMapRef = useRef(
    dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
  );

  const ref = useRef(null);

  const textContainerRef = useRef(null);
  const textRef = useRef(null);
  const [fontSize, setFontSize] = useState(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--libraryManagerNodeText"
    )
  );

  const libraryPropsMapState = useYMap(libraryPropsMapRef.current);

  const [isTopSelected, setIsTopSelected] = useState(false);
  const [isSelfSelected, setIsSelfSelected] = useState(false);

  const [isDoorOpen, setIsDoorOpen] = useState(false);

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

  useEffect(() => {
    const checkOverflow = () => {
      if (textContainerRef.current && textRef.current) {
        const containerWidth = textContainerRef.current.offsetWidth - 20;
        const textWidth = textRef.current.scrollWidth;

        console.log("widths: ", containerWidth, textWidth);

        // Decrease/Increase the font size until the text fits
        let newFontSize = parseFloat(fontSize);

        newFontSize = newFontSize * (containerWidth / textWidth);

        newFontSize = min(
          newFontSize,
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--libraryManagerNodeText"
            )
          )
        );

        newFontSize = max(newFontSize, 0.8);

        console.log("new Font size: ", newFontSize);

        setFontSize(`${newFontSize}rem`);
      }
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    if (textContainerRef.current) {
      observer.observe(textContainerRef.current);
    }
    return () => {
      if (textContainerRef.current) {
      observer.unobserve(textContainerRef.current);
      }
    };
  }, [fontSize]);

  return (
    <div
      ref={ref}
      className={`
        w-full h-full
        library-${libraryId}  

        transition-colors ease-in-out duration-200

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
      <div className="w-full max-w-full h-full flex flex-row items-center justify-between hover:bg-appLayoutHover transition-colors duration-100 ease-out">
        <button
          className={
            "flex-grow min-w-0 h-full flex justify-start items-center pl-3 hover:text-appLayoutHighlight hover:bg-appLayoutHover transition-colors duration-100"
          }
          onClick={() => {
            console.log("Library Entry when clicked: ", libraryPropsMapState);
            setLibraryId(libraryId);
            setItemId("unselected");
            setPanelOpened(true);
          }}
          onMouseEnter={() => {
            setIsDoorOpen(true);
          }}
          onMouseLeave={() => {
            setIsDoorOpen(false);
          }}
        >
          <div className="relative h-libraryManagerNodeIconSize w-libraryManagerNodeIconSize min-w-libraryManagerNodeIconSize">
            <AnimatePresence mode="sync">
              {isDoorOpen && (
                <motion.span
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.6 }}
                  transition={{ duration: 0.1 }}
                  key="doorOpen"
                  className="icon-[ion--enter] h-full w-full absolute top-0 left-0 transition-colors duration-100"
                ></motion.span>
              )}

              {!isDoorOpen && (
                <motion.span
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.6 }}
                  transition={{ duration: 0.1 }}
                  key="doorClose"
                  className="icon-[ion--enter-outline] h-full w-full absolute top-0 left-0 transition-colors duration-100"
                ></motion.span>
              )}
            </AnimatePresence>
          </div>

          <div
            ref={textContainerRef}
            style={{ fontSize }}
            className="flex-grow min-w-0 flex justify-start items-center  transition-colors duration-100 pb-px ml-3"
          >
            <p
              className="w-fit max-w-full overflow-hidden text-nowrap overflow-ellipsis"
              ref={textRef}
            >
              {libraryPropsMapState.library_name}
            </p>
          </div>
        </button>
        <button
          className="h-libraryManagerNodeEditButtonWidth w-libraryManagerNodeEditButtonWidth min-w-libraryManagerNodeEditButtonWidth px-2 rounded-full m-2  text-appLayoutTextMuted hover:text-appLayoutHighlight hover:bg-appLayoutInverseHover transition-colors duration-100 ease-out"
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

export default React.memo(LibraryManagerNode);
